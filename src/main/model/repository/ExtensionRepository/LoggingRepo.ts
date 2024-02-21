import Logging, { LoggingAttributes, LoggingCreationAttributes } from "../../entity/ExtensionDatabase/Logging";
import BaseRepository from "../.BaseRepository";

class LoggingRepo extends BaseRepository<Logging, LoggingAttributes, LoggingCreationAttributes>{

}

export default new LoggingRepo(Logging as any)