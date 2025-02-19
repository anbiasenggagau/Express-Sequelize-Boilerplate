import DataHistory, { DataHistoryAttributes, DataHistoryCreationAttributes } from "../entity/DataHistory";
import BaseRepository from "./.BaseRepository";

class DataHistoryRepo extends BaseRepository<DataHistory, DataHistoryAttributes, DataHistoryCreationAttributes> {

}

export default new DataHistoryRepo(DataHistory)