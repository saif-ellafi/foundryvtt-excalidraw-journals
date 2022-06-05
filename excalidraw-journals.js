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
            <div class="form-fields" style="justify-content: center;"><input type="checkbox" id="excalidraw" name="excalidraw" onclick="toggle()"></div>
            <label for="exc_shared">Shared</label>
            <div class="form-fields" style="justify-content: center;"><input type="checkbox" checked disabled id="exc_shared" name="exc_shared"></div>
          </div>
          <script>
          function toggle() {
            let enabled = $("#excalidraw").prop('checked');
            if (enabled) {
              $("#exc_shared").prop('disabled', false);
            } else {
              $("#exc_shared").prop('disabled', true);
            }
          }
          </script>
          `
    );
    elem.outerHeight(elem.outerHeight() + 35);
  }
});

Hooks.on('preCreateJournalEntry', function (entry, params, options) {
  if (params.excalidraw) {
    let room = ''
    if (params.exc_offline) {
      const roomCode = _excaMakeRoomId();
      const roomCypher = _excaMakeRoomCypher();
      `#room=${roomCode},${roomCypher}`;
    }
    entry.data.update({
      content: `
      <div style="height: 100%;"><iframe src="https://excalidraw.com/${room}" width="100%" height="100%"></iframe></div>
      `
    });
    Hooks.once('createJournalEntry', function (journal) {
      journal.sheet.position.width = canvas.screenDimensions[0] * 0.50;
      journal.sheet.position.height = canvas.screenDimensions[1] * 0.75;
    });
  }
});