import Stores, { StoresAttributes, StoresCreationAttributes } from "../entity/MainDatabase/Stores";
import BaseRepository from "./.BaseRepository";

class StoresRepo extends BaseRepository<Stores, StoresAttributes, StoresCreationAttributes>{

}

export default new StoresRepo(Stores as any)