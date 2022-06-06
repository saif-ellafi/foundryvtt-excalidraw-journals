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

function _excaDelayedClose(app, fallback) {
  app.element.find('.window-header')[0].innerHTML = 'Saving...';
  app.minimize();
  setTimeout(() => {fallback()}, 20000);
}

async function _excaAssignRoom(document) {
  if (!document.getFlag('excalidraw-journals', 'room')) {
    await document.setFlag('excalidraw-journals', 'room', {
      roomCode: _excaMakeRoomId(),
      roomCypher: _excaMakeRoomCypher()
    })
  }
  if (!document.roomCode) {
    document.roomCode = document.getFlag('excalidraw-journals', 'room').roomCode;
    document.roomCypher = document.getFlag('excalidraw-journals', 'room').roomCypher;
  }
}

class ExcalidrawActor extends ActorSheet {

  close() {
    _excaDelayedClose(this, () => super.close());
  }

  async getData() {
    const _default = super.getData();
    _excaAssignRoom(this.actor);
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
      template: `./modules/excalidraw-journals/excalidraw-sheet.hbs`
    };
  }

}

// Adds Excalidraw as a Sheet Mode for Journal Entries
Hooks.once('ready', function () {
  Actors.registerSheet('excalidraw-journals', ExcalidrawActor);

  Hooks.on('getJournalSheetHeaderButtons', function(app, buttons) {
    if (app.constructor.name === 'JournalSheet') {
      buttons.unshift({
        label: "Excalidraw",
        class: "entry-excalidraw",
        icon: "fas fa-pen-alt",
        onclick: async ev => app._onSwapMode(ev, "excalidraw")
      })
    }
  });

  libWrapper.register('excalidraw-journals', 'JournalSheet.prototype.template', function (wrapped, ...args) {
    if ( this._close) this.close = this._close;
    if ( this._sheetMode === "image" ) return ImagePopout.defaultOptions.template
    else if (this._sheetMode === "excalidraw") {
      _excaAssignRoom(this.document);
      this._close = this.close;
      this.close = () => _excaDelayedClose(this, () => this._close());
      return `./modules/excalidraw-journals/excalidraw-sheet.hbs`
    } else return "templates/journal/sheet.html";
  }, 'OVERRIDE');
});

// Adds Journal Note offline Excalidraw to left controls
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