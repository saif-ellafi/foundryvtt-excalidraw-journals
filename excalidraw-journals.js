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
  app.maximize = () => {};
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

// async function _excaRenderSheet(app) {
//   const sheet = app.object.sheet;
//   await sheet.close()
//   app.object._sheet = null;
//   delete app.object.apps[sheet.appId];
//   await app.document.setFlag('core', 'sheetClass', `excalidraw-journals.ExcalidrawJournal`);
//   app.object.sheet.render(true);
// }

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

class ExcalidrawJournalPage extends JournalPageSheet {

  static get defaultOptions() {
    const options = foundry.utils.mergeObject(super.defaultOptions, {
      width: canvas.screenDimensions[0] * 0.50,
      height: canvas.screenDimensions[1] * 0.75,
      resizable: true
    });
    options.classes.push("exca");
    return options;
  }

  async getData() {
    const _default = super.getData();
    _excaAssignRoom(this.document);
    return {
      ..._default,
      roomCode: this.document.roomCode,
      roomCypher: this.document.roomCypher
    };
  }

  get template() {
    return `modules/excalidraw-journals/excalidraw-sheet.hbs`;
  }

}

class ExcalidrawItem extends ItemSheet {

  close() {
    _excaDelayedClose(this, () => super.close());
  }

  async getData() {
    const _default = super.getData();
    _excaAssignRoom(this.document);
    return {
      ..._default,
      roomCode: this.document.roomCode,
      roomCypher: this.document.roomCypher
    };
  }

  static get defaultOptions() {
    const _default = super.defaultOptions;

    return {
      ..._default,
      classes: ['sheet', 'excalidraw-journal', 'form'],
      width: canvas.screenDimensions[0] * 0.50,
      height: canvas.screenDimensions[1] * 0.75,
      resizable: true,
      template: `./modules/excalidraw-journals/excalidraw-sheet.hbs`
    };
  }

  get template() {
    return `./modules/excalidraw-journals/excalidraw-sheet.hbs`;
  }

}

// Adds Excalidraw as a Sheet Mode for Journal Entries
Hooks.once('init', function () {
  Actors.registerSheet('excalidraw-journals', ExcalidrawActor);
  // Journal.registerSheet('excalidraw-journals', ExcalidrawJournalPage);


  // game.documentTypes.JournalEntryPage.push('exca');
  DocumentSheetConfig.registerSheet(JournalEntryPage, "excalidraw-journals", ExcalidrawJournalPage, {
    types: ["exca"],
    makeDefault: true,
    label: 'exca'
  });


  Items.registerSheet('excalidraw-journals', ExcalidrawItem);

  // Hooks.on('getJournalSheetHeaderButtons', function(app, buttons) {
  //   if (app.document.testUserPermission(game.user, 3) && app.object._getSheetClass().name !== 'ExcalidrawJournal') {
  //     buttons.unshift({
  //       label: "Excalidraw",
  //       class: "entry-excalidraw",
  //       icon: "fas fa-pen-alt",
  //       onclick: async ev => _excaRenderSheet(app)
  //     });
  //   }
  // });
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
