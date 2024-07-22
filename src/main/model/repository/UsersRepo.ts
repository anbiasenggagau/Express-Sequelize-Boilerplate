import Users, { UsersAttributes, UsersCreationAttributes } from "../entity/Users";
import BaseRepository from "./.BaseRepository";

class UsersRepo extends BaseRepository<Users, UsersAttributes, UsersCreationAttributes> {

}

export default new UsersRepo(Users as any)