import 'react';
import 'react-dom';
import '@excalidraw/excalidraw'
import '../styles/styles.css';

import React from "react";
import ReactDOM from "react-dom";

import {App} from "./App";


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

Hooks.on('preCreateJournalEntry', function (entry, params) {
  if (params.excalidraw) {
    const roomCode = _excaMakeRoomId();
    const roomCypher = _excaMakeRoomCypher();
    entry.data.update({
      content: `
      <div style="height: 100%;"><iframe src="https://excalidraw.com/#room=${roomCode},${roomCypher}" width="100%" height="100%"></iframe></div>
      `
    });
    Hooks.once('createJournalEntry', function (journal) {
      journal.sheet.position.width = canvas.screenDimensions[0] * 0.50;
      journal.sheet.position.height = canvas.screenDimensions[1] * 0.75;
    });
  }
});

class ExcalidrawSheet extends ActorSheet {

  static get defaultOptions() {
    const _default = super.defaultOptions;

    return {
      ..._default,
      classes: ['sheet', 'actor', 'excalidraw-actor', 'form'],
      width: canvas.screenDimensions[0] * 0.50,
      height: canvas.screenDimensions[1] * 0.75,
      resizable: true,
      template: `./modules/excalidraw-journals/excalidraw-actor.hbs`
    };
  }

  render(force, options) {
    super.render(force, options);
    setTimeout(() => {
      console.log(this);
      const excalidrawWrapper = this.element.find("#excalidraw-actor-app")[0];
      ReactDOM.render(React.createElement(App), excalidrawWrapper);
    }, 500);
    return this;
  }

}

Hooks.once('ready', function () {
  Actors.registerSheet('excalidraw-journals', ExcalidrawSheet);
})