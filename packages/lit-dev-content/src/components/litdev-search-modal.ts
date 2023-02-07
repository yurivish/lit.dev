/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css, html, LitElement, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import './lazy-svg.js';
import './litdev-search.js';
import type {LitDevSearch} from './litdev-search.js';

type DialogWithModal = HTMLDialogElement & {
  showModal: () => void;
  close: () => void;
};

@customElement('litdev-search-modal')
export class LitDevSearchModal extends LitElement {
  /**
   * Whether or not the dialog is open.
   */
  @property({type: Boolean}) open = false;

  /**
   * The src of the icon to use for the search button.
   */
  @property({type: String}) iconSrc = '/images/icons/lit-search.svg#icon';

  @query('dialog', true) dialogEl!: DialogWithModal;
  @query('#content', true) contentWrapper!: HTMLElement;
  @query('litdev-search', true) searchEl!: LitDevSearch;

  /**
   * A settable function that returns the body elemenr or whatever element that
   * should have overflow hidden when the dialog is open.
   *
   * @returns The element that should have its overflow hidden when the dialog
   *     is open.
   */
  getBody = () => document?.body;

  private _onWindowClick = () => (this.open = false);

  connectedCallback(): void {
    super.connectedCallback();
    if (window) {
      // This is the case if an ancestor is hidden and the DOM is inert because
      // of a hidden open dialog that is not clickable. Must be window and not
      // body because the body is inert and does not receive clicks.
      window.addEventListener('click', this._onWindowClick);
    }
  }

  render() {
    return html`
      <button
        aria-label="Site search"
        title="Site search"
        @click=${this.showOnClick(true)}
      >
        <lazy-svg loading="eager" href=${this.iconSrc}></lazy-svg>
      </button>
      <dialog @click=${this.showOnClick(false)}>
        <div id="content" @click=${(e: Event) => e.stopPropagation()}>
          <litdev-search @close=${() => (this.open = false)}></litdev-search>
        </div>
      </dialog>
    `;
  }

  /**
   * Shows or hides the dialog and sets the overflow of the body element.
   *
   * @param show Whether or not to show the dialog.
   */
  private showDialog(show: boolean) {
    const body = this.getBody();
    if (show) {
      this.dialogEl.showModal();
      if (body) {
        body.style.overflow = 'hidden';
      }
    } else {
      this.dialogEl.close();
      if (body) {
        body.style.overflow = '';
      }
    }
  }

  /**
   * Returns a click handler that shows or hides the dialog.
   *
   * @param shouldOpen Whether or not the dialog should be opened.
   */
  private showOnClick(shouldOpen: boolean) {
    return (e: Event) => {
      // We need to stop propagation so that the initial button click does not
      // bubble up to window and immediately close itself.
      e.stopPropagation();
      this.open = shouldOpen;
    };
  }

  updated(changed: PropertyValues<this>) {
    super.updated(changed);

    if (changed.has('open')) {
      this.showDialog(this.open);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (window) {
      window.removeEventListener('click', this._onWindowClick);
    }
  }

  static styles = css`
    :host {
      --search-modal-padding: 16px;
      --_border-radius: 4px;
      display: block;
      color: inherit;
    }

    button {
      font-size: inherit;
      font-weight: inherit;
      font-family: inherit;
      color: inherit;
      opacity: 0.8;
      padding: 0px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      border: none;
    }

    button:hover,
    button:focus,
    button:active {
      opacity: 1;
    }

    lazy-svg,
    lazy-svg::part(svg) {
      color: currentColor;
    }

    lazy-svg::part(svg) {
      width: 2.125em;
      height: 2.125em;
    }

    button span {
      margin-inline-start: 8px;
      font-size: 0.9em;
    }

    dialog {
      padding: 0;
      border: none;
      border-radius: var(--_border-radius);
      inset-block: 60px auto;
      background-color: transparent;
      box-shadow: rgb(0 0 0 / 20%) 0px 11px 15px -7px,
        rgb(0 0 0 / 14%) 0px 24px 38px 3px, rgb(0 0 0 / 12%) 0px 9px 46px 8px;
    }

    dialog::backdrop {
      background-color: rgba(0, 0, 0, 0.8);
    }

    #content {
      padding: var(--search-modal-padding);
      box-sizing: border-box;
      width: 560px;
      max-width: 560px;
      background-color: var(--color-light-gray);
      border-radius: var(--_border-radius);
    }

    @media (max-width: 864px) {
      dialog {
        inset: 0;
        height: 100vh;
        width: 100vw;
      }

      #content {
        width: 100%;
        max-width: 100%;
        max-height: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: fixed;
        inset: 0;
      }

      litdev-search {
        flex-grow: 1;
      }
    }
  `;
}
