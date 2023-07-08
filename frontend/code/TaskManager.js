import { enqueueSnackbar } from "notistack"

/**
 * Task manager
 * 
 * @event updated When the list of tasks or a task's state changes
 */
export class TaskManager extends EventTarget {

    /** Singleton */
    static shared = new TaskManager()

    /** List of tasks */
    tasks = []

    /** List of task IDs and task group IDs that have been completed successfully */
    completedTaskIDs = []

    /** Maximum tasks to run at once */
    maxParallelTasks = 1

    /** Return list of tasks which are waiting to be run */
    get pendingTasks() {
        return this.tasks.filter(t => !t.isComplete && !t.running)
    }

    /** Return list of active tasks */
    get activeTasks() {
        return this.tasks.filter(t => t.running)
    }

    /** Start */
    constructor() {
        super()

        // Start a timer to process task running
        setInterval(() => this.processTasks(), 100)

    }

    /** @private Process tasks */
    processTasks() {

        // Run tasks that are ready
        let didChange = false
        for (let task of this.tasks)
            if (task.runIfNeeded())
                didChange = true

        // Remove old completed tasks
        let completedTaskRemoveDelay = 0
        let errorTaskRemoveDelay = 15000
        for (let i = 0 ; i < this.tasks.length ; i++) {

            // Skip if task is not complete
            let task = this.tasks[i]
            if (!task.isComplete) 
                continue

            // Check delay based on if it's a failed task
            let delay = task.lastRunFailed ? errorTaskRemoveDelay : completedTaskRemoveDelay
            if (task.lastRunDate + delay > Date.now())
                continue

            // Task can be removed
            this.tasks.splice(i--, 1)
            didChange = true

        }

        // Sort tasks by last run date
        if (didChange)
            this.dispatchEvent(new Event('updated'))

    }

    /** Schedule a task */
    scheduleTask(task) {
        task.manager = this
        this.tasks.push(task)
        this.dispatchEvent(new Event('updated'))
    }

    /** Returns true if a specified task ID or group ID has been completed */
    isCompleted(taskID) {

        // Check if it's in the completed array
        if (!this.completedTaskIDs.includes(taskID))
            return false

        // Check for any active tasks with this group ID
        if (this.tasks.find(t => t.groupID == taskID && !t.isComplete))
            return false

        // Done
        return true

    }

    /** Create a task builder */
    build() {
        return new TaskBuilder(this)
    }

}

/** Task Builder */
class TaskBuilder {

    /** @type {TaskManager} Task manager */
    manager = null

    /** Constructor */
    constructor(manager) {
        this.manager = manager
    }

    /** Clone this object */
    clone() {

        // Create new instance
        let copy = new TaskBuilder()

        // Ccopy fields
        for (let field in this) {
            if (Array.isArray(this[field]))
                copy[field] = this[field].slice()
            else if (field == 'tags')
                copy[field] = Object.assign({}, this[field])
            else
                copy[field] = this[field]
        }

        // Done
        return copy

    }

    /** @chainable Set task delay */
    delay(delay) {
        let copy = this.clone()
        copy._delay = delay
        return copy
    }

    /** @chainable Set task max iterations */
    maxIterations(maxIterations) {
        let copy = this.clone()
        copy._maxIterations = maxIterations
        return copy
    }

    /** Repeat for a certain amount of iterations */
    repeat(amount) {
        return this.maxIterations(amount)
    }

    /** Repear forever */
    repeatForever() {
        return this.maxIterations(Infinity)
    }

    /** @chainable Set task retry on fail */
    retryOnFail(retryOnFail) {
        let copy = this.clone()
        copy._retryOnFail = retryOnFail
        return copy
    }

    /** @chainable Set the group ID */
    group(groupID) {
        let copy = this.clone()
        copy._groupID = groupID
        return copy
    }

    /** @chainable Set the task ID */
    id(id) {
        let copy = this.clone()
        copy._id = id
        return copy
    }

    /** @chainable Set the task name */
    name(name) {
        let copy = this.clone()
        copy._name = name
        return copy
    }

    /** @chainable Set the task action */
    action(action) {
        let copy = this.clone()
        copy._action = action
        return copy
    }

    /** @chainable Add a task dependency */
    dependsOn(taskID) {
        let copy = this.clone()
        copy._dependencies = copy._dependencies || []
        copy._dependencies.push(taskID)
        return copy
    }

    /** Set a custom tag */
    tag(name, value) {
        let copy = this.clone()
        copy.tags = copy.tags || {}
        copy.tags[name] = value
        return copy
    }

    /** @returns {Task} Build and schedule the task */
    schedule() {
        
        // Create task
        let task = new Task()
        task.id = this._id ?? task.id
        task.name = this._name
        task.action = this._action
        task.delay = this._delay ?? task.delay
        task.maxIterations = this._maxIterations ?? task.maxIterations
        task.retryOnFail = this._retryOnFail ?? task.retryOnFail
        task.groupID = this._groupID ?? task.groupID
        task.dependencies = this._dependencies ?? task.dependencies
        task.tags = this.tags ?? task.tags
        this.manager.scheduleTask(task)
        return task

    }

}

/** Task */
export class Task {

    /** @type {TaskManager} Task manager */
    manager = null

    /** Task ID */
    id = ''

    /** Task group ID */
    groupID = ''

    /** Task name */
    name = ''

    /** Current status */
    status = ''

    /** Delay between executions */
    delay = 0

    /** Number of total executions to run */
    maxIterations = 1

    /** Number of times the task has run */
    iteration = 0

    /** @type {async (task: Task) => void} Executable function */
    action = null

    /** True if currently running */
    running = false

    /** Date the task last started or ended */
    lastRunDate = 0

    /** True if the last run failed */
    lastRunFailed = false

    /** If true, will retry the task upon failure by increasing the maxIterations by one */
    retryOnFail = false

    /** List of dependencies (task IDs or group IDs) that must be complete before this task can be run */
    dependencies = []

    /** List of custom tags */
    tags = {}

    /** For tasks with progress, this is a value between 0 and 1 */
    progress = -1

    /** True if this task is complete and won't run again */
    get isComplete() {
        return !this.running && this.iteration >= this.maxIterations
    }

    /** @private Run the task if needed. Returns true if the task was started. */
    runIfNeeded() {

        // Check if task is already running
        if (this.running)
            return false

        // Check if task has finished it's iterations
        if (this.iteration >= this.maxIterations)
            return false

        // Check if enough time has passed
        let delay = this.lastRunFailed ? Math.max(5000, this.delay) : this.delay
        if (this.lastRunDate + delay > Date.now())
            return false

        // Check if too many tasks are running
        let runningTasks = this.manager.tasks.filter(t => t.running)
        if (runningTasks.length >= this.manager.maxParallelTasks)
            return false

        // Check dependencies
        for (let dependencyID of this.dependencies)
            if (!this.manager.isCompleted(dependencyID))
                return false

        // Start the task
        this.runTask()
        return true

    }

    /** @private Run the task. */
    async runTask() {

        // Run the task
        this.running = true
        this.lastRunDate = Date.now()
        this.iteration++
        this.status = 'Running'
        this.lastRunFailed = false
        this.manager.dispatchEvent(new Event('updated'))
        try {

            // Run it
            await this.action(this)

            // Success, store completed IDs
            this.manager.completedTaskIDs.push(this.id)
            if (this.groupID)
                this.manager.completedTaskIDs.push(this.groupID)

            // Show success
            enqueueSnackbar(`${this.name || this.id || '(anonymous task)'} completed`, { variant: 'success', autoHideDuration: 2000 })

        } catch (err) {

            // Check if cancelled
            if (err.name == 'AbortError') {

                // Log cancellation
                this.status = 'Cancelled'
                this.lastRunFailed = false

                // Log it
                console.warn(`${this.name || this.id || '(anonymous)'} cancelled: `, err)

            } else {

                // Log errors
                this.status = 'Error: ' + err.message
                this.lastRunFailed = true
                if (this.retryOnFail)
                    this.maxIterations += 1

                // Log error
                console.warn(`${this.name || this.id || '(anonymous)'} failed: `, err)
                enqueueSnackbar(`${this.name || this.id || '(anonymous task)'} failed: ${err.message}`, { variant: 'error' })

            }

        }

        // Done
        this.running = false
        this.lastRunDate = Date.now()
        this.manager.dispatchEvent(new Event('updated'))

    }

    /** Set status */
    async setStatus(status) {

        // Update status
        this.status = status

        // Log the change
        console.debug(`${this.name || this.id || '(anonymous task)'}: ${status}`)

        // Notify update
        this.manager.dispatchEvent(new Event('updated'))

        // Wait a bit ... this helps with tasks that use 100% CPU
        await new Promise(resolve => setTimeout(resolve, 10))

    }

    /** Set task progress */
    setProgress(progress) {
        this.progress = progress
        this.manager.dispatchEvent(new Event('updated'))
    }

}