const DEBUG = true;

document.addEventListener('DOMContentLoaded', async () => {
    console.log(getGroupId())

    var user_list = document.getElementById("user_list");

    console.log("Loading browser sdk");

    var groupId = getGroupId();

    var url = "https://matrix.org/_matrix/client/r0/register?kind=guest";
    const res = await axios.post(url, {});
    const { data } = await res;
    console.log(data);

    var access_token = data.access_token;

    var summary = await getSummary(groupId, access_token);
    if (DEBUG) {
        console.log("Summary : " + JSON.stringify(summary, null, 4));
    }

    let users = (await axios.get(`https://matrix.org/_matrix/client/r0/groups/${getGroupId()}/users`, {
        headers: {
            Authorization: "Bearer " + data.access_token
        }
    })).data;

    users.chunk.forEach(async (user) => {
        console.log(user);
        let user_div = document.createElement("div");
        user_div.classList.add("user");

        let user_image = document.createElement("img");
        user_image.src = "https://matrix.org/_matrix/media/r0/download/" + user.avatar_url.replace("mxc://", "");
        user_div.appendChild(user_image);

        let user_name = document.createElement("p");
        user_name.innerHTML = user.displayname;
        user_div.appendChild(user_name);
        user_list.appendChild(user_div);
    });
});

function getGroupId() {
    let splited = document.URL.split("?");
    return splited[splited.length-1];
}

async function getSummary(groupId, access_token) {
    return (await axios.get(`https://matrix.org/_matrix/client/r0/groups/${getGroupId()}/summary`, {
        headers: {
            Authorization: "Bearer " + access_token
        }
    })).data;
}