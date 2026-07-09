let placingPin = false;

Hooks.on("getSceneControlButtons", controls => {

    const tokenControls = controls.find(c => c.name === "notes");

    tokenControls.tools.push({
        name: "journalPinMode",
        title: "Place Journal Pin",
        icon: "fas fa-map-pin",
        toggle: true,
        active: false,
        onClick: active => {
            placingPin = active;

            ui.notifications.info(
                active
                    ? "Click anywhere on the map."
                    : "Pin placement cancelled."
            );
        }
    });

});

Hooks.on("canvasReady", canvas => {

    canvas.stage.eventMode = "static";

    canvas.stage.on("pointerdown", async event => {

        if (!placingPin) return;

        placingPin = false;

        const pos = event.getLocalPosition(canvas.stage);

        const journal = await chooseJournal();

        if (!journal) return;

        await canvas.scene.createEmbeddedDocuments("Note", [{
            x: pos.x,
            y: pos.y,

            entryId: journal.id,

            icon: "icons/svg/book.svg",

            text: journal.name
        }]);

        ui.notifications.info("Journal pin created.");

    });

});

async function chooseJournal() {

    return new Promise(resolve => {

        const journals = game.journal.contents
            .sort((a,b)=>a.name.localeCompare(b.name));

        let html = `
        <form>

        <div class="form-group">
            <label>Journal</label>

            <select id="journalSelect" style="width:100%">
        `;

        for (let journal of journals){

            html += `<option value="${journal.id}">
                ${journal.name}
            </option>`;
        }

        html += `
            </select>
        </div>

        </form>
        `;

        new Dialog({

            title: "Create Journal Pin",

            content: html,

            buttons: {

                ok: {
                    label: "Create",

                    callback: html => {

                        const id = html.find("#journalSelect").val();

                        resolve(game.journal.get(id));

                    }
                },

                cancel: {

                    label: "Cancel",

                    callback: () => resolve(null)

                }

            },

            default: "ok"

        }).render(true);

    });

}