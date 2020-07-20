const DEBUG = true;
var serverUrl = "https://matrix.org/";

document.addEventListener('DOMContentLoaded', async () => {
    var urlParams = new URLSearchParams(window.location.search);

    var groupId = urlParams.get("groupId");
    debuglog("GroupId", groupId);

    if (urlParams.has("serverUrl")) {
        serverUrl = urlParams.get("serverUrl");
    }

    if (!serverUrl.endsWith("/")) {
        serverUrl += "/";
    }

    var access_token = await getAccessToken();

    getSummary(groupId, access_token);
    getRooms(groupId, access_token);
    getUsers(groupId, access_token);
});

async function getAccessToken() {
    const res = await axios.post(serverUrl + "_matrix/client/r0/register?kind=guest", {});
    const { data } = await res;
    debuglog("Result of guest registering", data);
    return data.access_token;
}

async function getSummary(groupId, access_token) {
    var summary = (await axios.get(serverUrl + `_matrix/client/r0/groups/${groupId}/summary`, {
        headers: {
            Authorization: "Bearer " + access_token
        }
    })).data;
    debuglog("Summary", summary);

    document.getElementById("icon").src = serverUrl + "_matrix/media/r0/download/" + summary.profile.avatar_url.replace("mxc://", "");
    document.getElementById("description").innerHTML = summary.profile.short_description;
    document.getElementById("long_description").innerHTML = summary.profile.long_description;
    document.getElementById("name").innerHTML = summary.profile.name;
}

async function getRooms(groupId, access_token) {
    var room_list = document.getElementById("room_list");
    let rooms = (await axios.get(serverUrl + `_matrix/client/r0/groups/${groupId}/rooms`, {
        headers: {
            Authorization: "Bearer " + access_token
        }
    })).data;
    debuglog("Room", rooms);

    rooms.chunk.forEach(async (room) => {
        debuglog("Room", room);
        let room_div = document.createElement("div");
        room_div.classList.add("user");

        let room_image = document.createElement("img");
        if (room.avatar_url != null && room.avatar_url != "") {
            room_image.src = serverUrl + "_matrix/media/r0/download/" + room.avatar_url.replace("mxc://", "");
        }
        room_div.appendChild(room_image);

        let room_name = document.createElement("p");
        room_name.innerHTML = (room.name != "" && room.name != null) ? room.name : room.room_id;
        room_div.appendChild(room_name);
        room_list.appendChild(room_div);
    });
}

async function getUsers(groupId, access_token) {
    var user_list = document.getElementById("user_list");
    let users = (await axios.get(serverUrl + `_matrix/client/r0/groups/${groupId}/users`, {
        headers: {
            Authorization: "Bearer " + access_token
        }
    })).data;

    users.chunk.forEach(async (user) => {
        debuglog("User", user);
        let user_div = document.createElement("div");
        user_div.classList.add("user");

        let user_image = document.createElement("img");
        if (user.avatar_url != null && user.avatar_url != "") {
            user_image.src = serverUrl + "_matrix/media/r0/download/" + user.avatar_url.replace("mxc://", "");
        }
        user_div.appendChild(user_image);

        let user_name = document.createElement("p");
        user_name.innerHTML = (user.displayname != "" && user.displayname != null) ? user.displayname : user.user_id;
        user_div.appendChild(user_name);
        user_list.appendChild(user_div);
    });
}


function getGroupId() {
    let splited = document.URL.split("?");
    return splited[splited.length-1];
}

function debuglog(name, content) {
    if (DEBUG) {
        console.log(name + " : " + JSON.stringify(content, null, 4));
    }
}
