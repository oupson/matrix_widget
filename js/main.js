const DEBUG = true;

var serverUrl = "https://matrix.org/";

document.addEventListener('DOMContentLoaded', async () => {
    var urlParams = new URLSearchParams(window.location.search);

    var groupId = urlParams.get("groupId");
    debuglog("GroupId", groupId);

    if (groupId != null) {
        var joinButton = /** @type {HTMLAnchorElement | null} */(document.getElementById("join_button"));
        if (joinButton != null)
            joinButton.href = "https://matrix.to/#/" + groupId;

        if (urlParams.has("serverUrl")) {
            serverUrl = /** @type {string} */(urlParams.get("serverUrl"));
        }

        if (!serverUrl.endsWith("/")) {
            serverUrl += "/";
        }

        getAccessToken().then((accessToken) => {
            if (groupId != null) {
                getSummary(groupId, accessToken);
                getRooms(groupId, accessToken);
                getUsers(groupId, accessToken);
            }
        })
    } else {
        console.error("Error, group id is null");
    }
});

/**
 * Retrieve an anonymous access token from the server (Server must support anonymous login)
 * @returns {Promise<string>} The promise, where value is the access token
 */
async function getAccessToken() {
    return fetch(serverUrl + "_matrix/client/r0/register?kind=guest", {
        method: "POST",
        body: "{}"
    }).then((r) => r.json())
        .then((data) => {
            debuglog("Result of guest registering", data);
            return data.access_token
        });
}

/**
 * Function that add the summary to the widget
 * @param {string} groupId The group id
 * @param {string} accessToken retrieved from anonymous login.
 */
async function getSummary(groupId, accessToken) {
    fetch(serverUrl + `_matrix/client/r0/groups/${groupId}/summary`, {
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }).then((res) => res.json())
        .then((summary) => {
            debuglog("Summary", summary);

            var icon = /** @type {HTMLImageElement | null} */(document.getElementById("icon"));
            var description = document.getElementById("description");
            var longDescription = document.getElementById("long_description");
            var name = document.getElementById("name");

            if (description != null)
                description.innerHTML = summary.profile.short_description;
            if (longDescription != null)
                longDescription.innerHTML = summary.profile.long_description;
            if (name != null)
                name.innerHTML = summary.profile.name;

            if (summary.profile.avatar_url != null && summary.profile.avatar_url != "" && icon != null) {
                icon.src = serverUrl + "_matrix/media/r0/download/" + summary.profile.avatar_url.replace("mxc://", "");
            } else if (icon != null && icon.parentNode != null) {
                let groupImageDiv = document.createElement("div")
                groupImageDiv.classList.add("group_image_replacement");
                groupImageDiv.innerHTML = "<p>" + summary.profile.name[0] + "</p>";
                icon.parentNode.replaceChild(groupImageDiv, icon);
            }
        })
}

/**
 * Append the rooms to the widget
 * @param {string} groupId The group id
 * @param {string} accessToken retrieved from anonymous login.
 */
function getRooms(groupId, accessToken) {
    fetch(serverUrl + `_matrix/client/r0/groups/${groupId}/rooms`, {
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }).then((res) => res.json())
        .then((rooms) => {
            debuglog("Room", rooms);
            var room_list = document.getElementById("room_list");
            rooms.chunk.forEach(async (/** @type {any} */ room) => {
                debuglog("Room", room);

                let roomDiv = document.createElement("div");
                roomDiv.classList.add("user");

                if (room.avatar_url != null && room.avatar_url != "") {
                    let roomImage = document.createElement("img");
                    roomImage.src = serverUrl + "_matrix/media/r0/download/" + room.avatar_url.replace("mxc://", "");
                    roomDiv.appendChild(roomImage);
                } else {
                    let roomImageDiv = document.createElement("div")
                    roomImageDiv.classList.add("user_image_replacement");
                    roomImageDiv.innerHTML = "<p>" + room.name[0].toUpperCase() + "</p>";
                    roomDiv.appendChild(roomImageDiv);
                }

                let roomName = document.createElement("p");
                roomName.innerHTML = (room.name != "" && room.name != null) ? room.name : room.room_id;
                roomDiv.appendChild(roomName);

                if (room_list != null)
                    room_list.appendChild(roomDiv);
            });
        })
}

/**
 * Append the users to the widget
 * @param {string} groupId The group id
 * @param {string} accessToken retrieved from anonymous login.
 */
async function getUsers(groupId, accessToken) {
    fetch(serverUrl + `_matrix/client/r0/groups/${groupId}/users`, {
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }).then((res) => res.json())
        .then((users) => {
            debuglog("Users", users);

            var userList = document.getElementById("user_list");

            users.chunk.forEach(async (/** @type {any} */ user) => {
                debuglog("User", user);

                let userDiv = document.createElement("div");
                userDiv.classList.add("user");

                if (user.avatar_url != null && user.avatar_url != "") {
                    let userImage = document.createElement("img");

                    userImage.src = serverUrl + "_matrix/media/r0/download/" + user.avatar_url.replace("mxc://", "");
                    userDiv.appendChild(userImage);
                } else {
                    let userImageDiv = document.createElement("div")
                    userImageDiv.classList.add("user_image_replacement");
                    userImageDiv.innerHTML = "<p>" + ((user.displayname != "" && user.displayname != null) ? user.displayname : user.user_id)[0].toUpperCase() + "</p>";
                    userDiv.appendChild(userImageDiv);
                }

                let user_name = document.createElement("p");
                user_name.innerHTML = (user.displayname != "" && user.displayname != null) ? user.displayname : user.user_id;
                userDiv.appendChild(user_name);

                if (userList != null)
                    userList.appendChild(userDiv);
            });
        })
}

/**
 * @param {string} name 
 * @param {*} content 
 */
function debuglog(name, content) {
    if (DEBUG) {
        console.log(name + " : " + JSON.stringify(content, null, 4));
    }
}
