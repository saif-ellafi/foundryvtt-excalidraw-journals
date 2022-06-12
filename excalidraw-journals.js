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

async function _excaRenderSheet(app) {
  const sheet = app.object.sheet;
  await sheet.close()
  app.object._sheet = null;
  delete app.object.apps[sheet.appId];
  await app.document.setFlag('core', 'sheetClass', `excalidraw-journals.ExcalidrawJournal`);
  app.object.sheet.render(true);
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

class ExcalidrawJournal extends JournalSheet {

  _getHeaderButtons() {
    const buttons = super._getHeaderButtons()
      .filter(b => !b.label.startsWith('JOURNAL'));
    if (game.user.isGM) {
      buttons.unshift({
        label: "Journal",
        class: "entry-text",
        icon: "fas fa-book",
        onclick: async ev => {
          const sheet = this.object.sheet;
          await super.close()
          this.object._sheet = null;
          delete this.object.apps[sheet.appId];
          await this.document.unsetFlag('core', 'sheetClass');
          this.object.sheet.render(true);
        }
      })
    }
    return buttons;
  }

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
Hooks.once('ready', function () {
  Actors.registerSheet('excalidraw-journals', ExcalidrawActor);
  Journal.registerSheet('excalidraw-journals', ExcalidrawJournal);
  Items.registerSheet('excalidraw-journals', ExcalidrawItem);

  Hooks.on('getJournalSheetHeaderButtons', function(app, buttons) {
    if (app.document.testUserPermission(game.user, 3) && app.object._getSheetClass().name !== 'ExcalidrawJournal') {
      buttons.unshift({
        label: "Excalidraw",
        class: "entry-excalidraw",
        icon: "fas fa-pen-alt",
        onclick: async ev => _excaRenderSheet(app)
      });
    }
  });
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
    Hooks.once('createJournalEntry', function(journal) {
      journal.sheet.position.width = canvas.screenDimensions[0] * 0.50;
      journal.sheet.position.height = canvas.screenDimensions[1] * 0.75;
    });
    Hooks.once('renderJournalSheet', async function (journal) {
      _excaRenderSheet(journal);
    });
  }
});