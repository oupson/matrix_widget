const DEBUG = false;
var serverUrl = "https://matrix.org/";

document.addEventListener('DOMContentLoaded', async () => {
    var urlParams = new URLSearchParams(window.location.search);

    var groupId = urlParams.get("groupId");
    debuglog("GroupId", groupId);

    document.getElementById("join_button").onclick = () => {
        window.open("https://matrix.to/#/" + groupId);
    }
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
    const data = await (await fetch(serverUrl + "_matrix/client/r0/register?kind=guest", {
        method: "POST",
        body: "{}"
    })).json()
    debuglog("Result of guest registering", data);
    return data.access_token;
}

async function getSummary(groupId, access_token) {
    var summary = await (await fetch(serverUrl + `_matrix/client/r0/groups/${groupId}/summary`, {
        headers: {
            Authorization: "Bearer " + access_token
        }
    })).json()
    debuglog("Summary", summary);

    if (summary.profile.avatar_url != null && summary.profile.avatar_url != "") {
        document.getElementById("icon").src = serverUrl + "_matrix/media/r0/download/" + summary.profile.avatar_url.replace("mxc://", "");
    } else { 
        let group_image_div = document.createElement("div")
        group_image_div.classList.add("group_image_replacement");
        group_image_div.innerHTML = "<p>" + summary.profile.name[0] + "</p>";
        document.getElementById("icon").parentNode.replaceChild(group_image_div, document.getElementById("icon"));
    }
    
    document.getElementById("description").innerHTML = summary.profile.short_description;
    document.getElementById("long_description").innerHTML = summary.profile.long_description;
    document.getElementById("name").innerHTML = summary.profile.name;
}

async function getRooms(groupId, access_token) {
    var room_list = document.getElementById("room_list");
    let rooms = await (await fetch(serverUrl + `_matrix/client/r0/groups/${groupId}/rooms`, {
        headers: {
            Authorization: "Bearer " + access_token
        }
    })).json();
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
    let users = await (await fetch(serverUrl + `_matrix/client/r0/groups/${groupId}/users`, {
        headers: {
            Authorization: "Bearer " + access_token
        }
    })).json();

    users.chunk.forEach(async (user) => {
        debuglog("User", user);
        let user_div = document.createElement("div");
        user_div.classList.add("user");

        if (user.avatar_url != null && user.avatar_url != "") {
            let user_image = document.createElement("img");
        
            user_image.src = serverUrl + "_matrix/media/r0/download/" + user.avatar_url.replace("mxc://", "");
            user_div.appendChild(user_image);
        } else {
            let user_image_div = document.createElement("div")
            user_image_div.classList.add("user_image_replacement");
            user_image_div.innerHTML = "<p>" + ((user.displayname != "" && user.displayname != null) ? user.displayname : user.user_id)[0] + "</p>";
            user_div.appendChild(user_image_div);
        }

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
