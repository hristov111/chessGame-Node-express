const { getUsers, getUserById, getUserByUsername, createUser
    , updatePlayerActiveState, getUserByEmail, createGuestUser, getGameSearchUsers,
    updateAllActiveState, getAllActiveUsers, getAllUnactiveUsers, getUsersByChar, updatePassword, updateUser, getAdminStatus
} = require('../connect/usersDB.js');
const bcrypt = require('bcrypt');



const hashPassword = async (password) => await bcrypt.hash(password, 10);

const usernameExistsFunc = async (req, res) => {

    try {
        const { guest_username } = req.query;
        if (!guest_username) return res.status(400).json({ message: "Username is required!" });
        const user = await getUserByUsername(guest_username);
        if (!user) {
            // username doest exist
            return res.status(200).json({ exists: false, message: "Username is available!" });
        } else {
            // username exits
            return res.status(200).json({ exists: true, message: "Username already taken!" });
        }
    } catch (error) {
        console.error("Error in usernameExistsFunc:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

const verifyPassword = async (enteredPassword, storedHash) => await bcrypt.compare(enteredPassword, storedHash);

const getAllUsersFunc = async (req, res) => {
    const users = await getUsers();
    const names = users.map(el => {
        return {
            id: el.id,
            username: el.username,
            games: el.total_games,
            wins: el.total_wins,
            losses: el.total_losses,
            online: el.is_online,
            playing: el.is_playing
        }
    });
    res.status(200).json(names);
}




const getSession = async (req, res) => {
    res.status(200).json(req.session.user);
}

const updatePasswordFunc = async (req, res) => {
    try {
        const { usr, newPassword, oldPassword } = req.body;
        const user = await getUserByUsername(usr);
        if (!user) return res.status(404).json({ msg: "User not found" });



        if (await verifyPassword(oldPassword, user.password_hash)) {
            const newpass_hash = await hashPassword(newPassword);
            const result2 = await updatePassword(usr, newpass_hash);

            if (result2.affectedRows === 0) return res.status(400).json({ msg: "Password update failed" });
            // now here i need to update password
            return res.status(200).json({ msg: "Password updated successfully" });
        } else return res.status(401).json({ msg: "Invalid current password" });
    } catch (error) {
        res.status(500).json({ msg: "Server error " + error });
    }
}

const logOutFunc = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Failed to destroy session");
            return res.status(500).json({ msg: "LogOut failed" });
        }

        res.clearCookie('connect.sid');
        return res.status(200).json({ msg: "Logged out successfull" });
    })
}

const updateProfileFunc = async (req, res) => {
    try {
        const { usr, username, firstname, lastname, email, biography } = req.body;
        const user = await getUserByUsername(usr);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const updateFields = {};
        if (firstname) updateFields.firstname = firstname;
        if (lastname) updateFields.lastname = lastname;
        if (username) updateFields.username = username;
        if (email) updateFields.email = email;
        if (biography) updateFields.biography = biography;

        if (Object.keys(updateFields).length === 0) return res.status(400).json({ msg: "No fields to update" });

        const result = await updateUser(usr, updateFields);

        if (result.affectedRows === 0) return res.status(400).json({ msg: "Update failed" });

        return res.status(200).json({ msg: "Profile updated successfully" });
    } catch (error) {
        return res.status(500).json({ msg: "Server error" })
    }
}

const updateGameSearchState = async (req, res) => {
    try {
        const { id, is_searching } = req.body;
        const user = await getUserById(id);
        const updateFields = {};
        if (!user) return res.status(404).json({ msg: "User doesnt exists" });

        if (is_searching == null) return res.status(400).json({ msg: "No fields to update" });
        updateFields.is_searching_for_game = is_searching;

        const result = await updateUser(id, updateFields);
        if (result.affectedRows === 0) return res.status(400).json({ msg: "Update failed" });

        return res.status(200).json({ msg: "Game search state updated successfully" });
    } catch (error) {
        return res.status(500).json({ msg: `Server error: ${error}` });
    }
}

const getUserByIdFunc = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await getUserById(id);
        if (!user) return res.status(404).json({ msg: `Nou user with id: ${id}` });
        const details =
        {
            id: user.id,
            text_rank: user.text_rank,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            profile_picture: user.profile_picture,
            games: user.total_games,
            wins: user.total_wins,
            rank: user.ranking,
            losses: user.total_losses,
            online: user.is_online,
            playing: user.is_playing,
            email: user.email,
            bio: user.biography
        }
        return res.status(200).json(details);
    } catch (error) {
        return res.status(500).json({ msg: error });
    }

}

const getUserByUsernameFunc = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: "Username and password are required" });
        }

        const user = await getUserByUsername(username);
        if (!user) return res.status(404).json({ msg: `There isn't a person with this username: ${username}` });
        if (await verifyPassword(password, user.password_hash)) {
            req.session.user = {
                id: user.id,
                username: username,
                profile_pic: user.profile_picture,
                isAdmin: user.isAdmin,
                isGuest: false,
            };
            return res.status(200).json(user );
        } else {
            return res.status(401).json({ msg: 'Wrong password!' });
        }
    } catch (error) {
        res.status(500).json({ msg: error });
    }
}

const createUserFunc = async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await getUserByUsername(username);
        // check if user exists
        if (!existingUser) {
            // if we are here this means we didnt find any user with this username so everything is okay
            // firstly we need to hash the password given
            const password_hash = await hashPassword(password);
            const id = await createUser(username, password_hash);
            req.session.user = {
                id: id,
                username: username,
                isAdmin: false,
                isGuest: false,
            };
            return res.status(201).json({ username });
        }
        res.status(409).json({ msg: `The username is already in use: ${username}` });
    } catch (error) {
        res.status(500).json({ msg: error });
    }

}

const getGameSearchingUsers = async (req, res) => {
    try {
        const id = req.params.id;
        // get searching people except for you 
        const users = await getGameSearchUsers(id);
        if (!users) return res.status(404).json({ msg: "No active game searchers" });
        const fixed_users = users.map(user => {
            return {
                id: user.id,
                text_rank: user.text_rank,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                profile_picture: user.profile_picture,
                games: user.total_games,
                wins: user.total_wins,
                rank: user.ranking,
                losses: user.total_losses,
                online: user.is_online,
                playing: user.is_playing
            }
        })
        return res.status(200).json(fixed_users);

    } catch (error) {
        return res.status(500).json({ msg: error });
    }
}

const createGuestUserFunc = async (req, res) => {
    try {
        const { guest_user } = req.body;

        if (!guest_user) return res.status(400).json({ msg: "Guest name is required" });
        // the guest_name is already checked so we directly create it 
        const id = await createGuestUser(guest_user);
        req.session.user = {
            id: id,
            username: guest_user,
            isAdmin: false,
            isGuest: true,
        };
        return res.status(201).json({
            ms: "Guest user created successfully",
            userId: id,
            username: guest_user
        });
    } catch (err) {
        console.error("Error creating guest user:", err);
        res.status(500).json({ msg: "Server error creating guest user" });
    }
}

const restoreGuestFunc = async (req, res) => {
    const { guest_id } = req.body;
    if (!guest_id) {
        return res.status(400).json({ msg: "Guest ID required" });
    }

    // Chek if guest exists and iss till valid
    const guestUser = await getUserById(guest_id);

    if (!guestUser || !guestUser.is_guest) {
        return res.status(404).json({ msg: "Guest not found or invalid" });
    }

    // Re-establish session
    req.session.user = {
        id: guest_id,
        username: guestUser.username,
        isAdmin: false,
        isGuest: true
    }

    return res.status(200).json({ msg: "Session restored", use: req.session.user });
}

const updatePlayerActiveStateFunc = async (req, res) => {
    try {
        const name = req.query.name;
        const status = req.query.status === "true" ? 1 : 0;
        if (!name || typeof status === 'undefined') {
            return res.status(400).json({ error: "Missing name or status" });

        }
        const result = await updatePlayerActiveState(name, status);
        res.status(200).json({ result });
    }catch(error){
        console.error("Update error:", error);
        return res.status(500).json({error: 'Server error'});
    }
   
}

const updateAllActiveStateFunc = async (req, res) => {
    const status = req.query.status;
    const result = updateAllActiveState(status);
}

const getallActiveUsersFunc = async (req, res) => {
    try {
        const users = await getAllActiveUsers();
        const names = users.map(el => {
            return {
                username: el.username,
                games: el.total_games,
                wins: el.total_wins,
                losses: el.total_losses
            }
        });
        res.status(200).json(names);
    } catch (error) {
        console.error("Error fetching active users:", error);
        return res.status(500).json({ message: "Interanl server error" });
    }
}
const getAllUnactiveUsersFunc = async (req, res) => {
    const result = await getAllUnactiveUsers();
    res.status(200).json(result);
}

const getUserByCharFunc = async (req, res) => {
    const { char } = req.query
    const users = await getUsersByChar(char);
    if (users.length == 0) return;
    const names = users.map(el => {
        return {
            username: el.username,
            games: el.total_games,
            wins: el.total_wins,
            losses: el.total_losses,
            online: el.is_online
        }
    })
    res.status(200).json(names);
}
//username       | password_hash    | is_online | total_games | total_wins | total_losses | firstname | lastname | email | biography | profile_picture
const getEverythingForUser = async (req, res) => {
    const { user } = req.params;
    const { password_hash, ...others } = await getUserByUsername(user);
    if (password_hash == undefined) return res.status(404);
    else {
        return res.status(201).json({ others });
    }
}


module.exports = {
    logOutFunc,
    getAllUsersFunc, getUserByIdFunc, getUserByUsernameFunc, createUserFunc, updateGameSearchState,
    updatePlayerActiveStateFunc, usernameExistsFunc, createGuestUserFunc,
    updateAllActiveStateFunc, getallActiveUsersFunc, getAllUnactiveUsersFunc, getUserByCharFunc, updatePasswordFunc
    , getSession, getEverythingForUser, updateProfileFunc, restoreGuestFunc, getGameSearchingUsers
}


