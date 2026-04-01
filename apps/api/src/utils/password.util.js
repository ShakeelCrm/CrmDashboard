import bcrypt from "bcrypt";
const SALT_ROUNDS = 10;
// Hash a password
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};
// Compare a password with a hash
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
