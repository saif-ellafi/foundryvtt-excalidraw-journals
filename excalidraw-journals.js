// https://excalidraw.com/#room=[0-9a-f]{20},[a-zA-Z0-9_-]{22}

function _excaMakeRoomId() {
  let result = '';
  const characters = 'abcdef0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function _excaMakeRoomCypher() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  const charactersLength = characters.length;
  for (let i = 0; i < 22; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

Hooks.on('renderDialog', function (dialog, elem) {
  if (dialog.title === game.i18n.localize('DOCUMENT.Create').replace('{type}', game.i18n.localize('DOCUMENT.JournalEntry'))) {
    elem.find("#document-create").last().append(`
          <div class="form-group">
            <label for="excalidraw">Excalidraw</label>
            <div class="form-fields"><input type="checkbox" id="excalidraw" name="excalidraw"></div>
          </div>
          `
    );
    elem.outerHeight(elem.outerHeight() + 35);
  }
});

Hooks.on('preCreateJournalEntry', function (entry, params, options) {
  if (params.excalidraw) {
    const roomCode = _excaMakeRoomId();
    const roomCypher = _excaMakeRoomCypher();
    entry.data.update({
      content: `
      <div style="height: 100%;"><iframe src="https://excalidraw.com/#room=${roomCode},${roomCypher}" width="100%" height="100%"></div>
      `
    });
    Hooks.once('createJournalEntry', function (journal) {
      journal.sheet.position.width = canvas.screenDimensions[0] * 0.50;
      journal.sheet.position.height = canvas.screenDimensions[1] * 0.75;
    });
  }
});

class ExcalidrawSheet extends ActorSheet {

  async getData() {
    const _default = super.getData();

    if (!this.actor.getFlag('excalidraw-journals', 'room')) {
      await this.actor.setFlag('excalidraw-journals', 'room', {
        roomCode: _excaMakeRoomId(),
        roomCypher: _excaMakeRoomCypher()
      })
    }

    if (!this.actor.roomCode) {
      this.actor.roomCode = this.actor.getFlag('excalidraw-journals', 'room').roomCode;
      this.actor.roomCypher = this.actor.getFlag('excalidraw-journals', 'room').roomCypher;
    }

    return {
      ..._default,
      roomCode: this.actor.roomCode,
      roomCypher: this.actor.roomCypher,
    };
  }


  static get defaultOptions() {
    const _default = super.defaultOptions;

    return {
      ..._default,
      classes: ['sheet', 'actor', 'excalidraw-actor', 'form'],
      width: canvas.screenDimensions[0] * 0.50,
      height: canvas.screenDimensions[1] * 0.75,
      resizable: true,
      template: `./modules/excalidraw-journals/excalidraw-actor.hbs`,
      params: {width: 999},
      options: {width: 988}
    };
  }

}

Hooks.once('ready', function () {
  Actors.registerSheet('excalidraw-journals', ExcalidrawSheet);
})

Hooks.on('getSceneControlButtons', function(controls) {
  const excalidrawPopup = new Dialog({
    title: 'Excalidraw (Private)',
    content: `<div style="height: ${canvas.screenDimensions[1] * 0.70}px"><iframe src="https://excalidraw.com" width="100%" height="100%"></div>`,
    buttons: {}
  });
  excalidrawPopup.options.resizable = true;
  excalidrawPopup.position.width = canvas.screenDimensions[0] * 0.50;
  excalidrawPopup.position.height = canvas.screenDimensions[1] * 0.75;
  controls.find(c => c.name === 'notes').tools.push({
    button: true,
    icon: "fas fa-book",
    name: "excalidraw-notes",
    onClick: () => excalidrawPopup.render(true),
    title: "Excalidraw",
    visible: true
  })
});