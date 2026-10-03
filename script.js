const SUPABASE_URL = "https://oabcvlcfqyiucncnimow.supabase.co/";
const SUPABASE_KEY = "sb_publishable_FFzglHl4NAdhb36ACzhfzg_sw_AW1W3";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
const skills = ["HTML", "CSS", "JavaScript"];

skills.map(function(skill) {
    console.log(skill);
});

const nameInput = document.getElementById("nameInput");
const rollButton = document.getElementById("rollButton");
const resultList = document.getElementById("resultList");

const players = [];

async function loadPlayers() {
    const { data, error } = await supabaseClient
        .from("players")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        console.log(error);
        return;
    }

    data.forEach(function (player) {
        const listItem = document.createElement("li");

        listItem.textContent = player.name + " → " + player.roll;

        resultList.appendChild(listItem);
    });
}

loadPlayers();

rollButton.addEventListener("click", async function () {

    const name = nameInput.value;

    if (name === "") {
        alert("Please enter a name");
        return;
    }

    if (players.length >= 100) {
        alert("Maximum 100 players");
        return;
    }

    const randomNumber = Math.floor(Math.random() * 100) + 1;

    const player = {
        name: name,
        roll: randomNumber
    };

    players.push(player);

    const { error } = await supabaseClient
    .from("players")
    .insert(player);

if (error) {
    console.log(error);
    alert("บันทึกไม่สำเร็จ");
    return;
}

    nameInput.value = "";
});
supabaseClient
    .channel("players-channel")
    .on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "players"
        },
        function (payload) {
            const newPlayer = payload.new;

            const listItem = document.createElement("li");

            listItem.textContent =
                newPlayer.name + " → " + newPlayer.roll;

            resultList.appendChild(listItem);
        }
    )
    .subscribe();