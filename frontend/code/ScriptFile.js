import { toast } from "react-toastify"
import { Tasks } from "./Tasks"
import { PlaygroundFile } from "./PlaygroundFile"

/**
 * Represents a script file.
 */
export class ScriptFile extends PlaygroundFile {

    /** File type description */
    static type = 'Script'

    /** Process the file if needed */
    async process() { }

}