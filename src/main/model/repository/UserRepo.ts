import User, { UserAttributes, UserCreationAttributes } from "../entity/User";
import BaseRepository from "./.BaseRepository";

class UserRepo extends BaseRepository<User, UserAttributes, UserCreationAttributes> {

}

export default new UserRepo(User)