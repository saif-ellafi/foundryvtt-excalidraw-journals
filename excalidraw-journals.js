// https://excalidraw.com/#room=[0-9a-f]{20},[a-zA-Z0-9_-]{22}

function _excaMakeRoomId() {
    var result           = '';
    var characters       = 'abcdef0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 20; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  return result;
}

function _excaMakeRoomCypher() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    var charactersLength = characters.length;
    for ( var i = 0; i < 22; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  return result;
}

Hooks.on('renderDialog', function(dialog, elem) {
  if (dialog.title === 'Create New Journal Entry') {
    elem.find(".form-group").append(`
          <div style="margin-left: -30px;" class="form-fields">
            <label for="excalidraw">Excalidraw</label>
            <input type="checkbox" id="excalidraw" name="excalidraw">
          </div>
          `
    );
  }
});

Hooks.on('preCreateJournalEntry', function(entry, params, options) {
  if (params.excalidraw) {
    const roomCode = _excaMakeRoomId();
    const roomCypher = _excaMakeRoomCypher();
    entry.data.update({content: `
      <div style="height: 100%;"><iframe src="https://excalidraw.com/#room=${roomCode},${roomCypher}" width="100%" height="100%"></iframe></div>
      `
    });
    Hooks.once('createJournalEntry', function(journal) {
      journal.sheet.position.width = canvas.screenDimensions[0] * 0.50;
      journal.sheet.position.height = canvas.screenDimensions[1] * 0.75;
    });
  }
});