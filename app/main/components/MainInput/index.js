import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "./styles.css";
import { chipiMagicFilterHelper } from "../../../lib/chipi";
import cn from "classnames";
import Logger from "../../../lib/logger";
import ActionsBar from "../ActionsBar";

const logger = new Logger("Component.mainInput");

const findLastTextNode = node => {
  if (node.nodeType === Node.TEXT_NODE) return node;
  let children = node.childNodes;
  for (let i = children.length - 1; i >= 0; i--) {
    let textNode = findLastTextNode(children[i]);
    if (textNode !== null) return textNode;
  }
  return null;
};

class MainInput extends Component {
  constructor(props) {
    super(props);
    this.emitChange = this.emitChange.bind(this);
    this.updateViewablePositionForCaret = this.updateViewablePositionForCaret.bind(this);
    this.updateViewablePositionForAutocomplete = this.updateViewablePositionForAutocomplete.bind(
      this
    );
    this.onPaste = this.onPaste.bind(this);
    this.normalizeSearchTerm = this.normalizeSearchTerm.bind(this);
    this.caretInEndOfInput = this.caretInEndOfInput.bind(this);
    this.getAutocompletePaddingTerm = this.getAutocompletePaddingTerm.bind(this);
    this.updateTerm = this.updateTerm.bind(this);
    this.getCurrentCaretPosition = this.getCurrentCaretPosition.bind(this);
    this.updateCaretPositionForNewTerm = this.updateCaretPositionForNewTerm.bind(this);
    this.updateNewTermInternally = this.updateNewTermInternally.bind(this);
    this.updateCaret = this.updateCaret.bind(this);
    this.onInputBlur = this.onInputBlur.bind(this);
    this.onInputFocus = this.onInputFocus.bind(this);

    this.input = React.createRef();
    this.inputWrapper = React.createRef();
    this.displayer = React.createRef();

    this.mainInputActions = [
      {
        name: "prevent enter",
        keys: "enter",
        fn: event => {
          if (this.input.current.textContent.length > 0) {
            event.preventDefault();
          }
        }
      },
      {
        name: "quick following",
        keys: "CmdOrCtrl+shift+f",
        fn: event => {
          this.updateTerm("/following ");
          event.preventDefault();
        }
      },
      {
        name: "quick recent",
        keys: "CmdOrCtrl+shift+r",
        fn: event => {
          this.updateTerm(":recent ");
          event.preventDefault();
        }
      },
      {
        name: "fill autocomplete",
        keys: ["right", "tab"],
        fn: event => {
          logger.verbose("right or tab called", { event });
          const { autocomplete } = this.props;

          if (this.caretInEndOfInput()) {
            if (autocomplete && autocomplete.value.length > 0) {
              // Autocomplete by arrow right only if autocomple value is shown
              this.updateTerm(autocomplete.value);
              event.preventDefault();
            }
          }
        }
      },
      {
        // Fast delete per space word
        name: "word delete",
        keys: `CmdOrCtrl+backspace`,
        fn: event => {
          logger.verbose("word delete called", { event });
          const { value } = this.props;

          const caretPosition = this.getCurrentCaretPosition();

          // Fast delete should only impact the string before the current caret position
          const stringBeforeCaret = value.substring(0, caretPosition);
          const stringAfterCaret = value.substring(caretPosition);

          let wordsBeforeCaret = stringBeforeCaret.split(" ");

          if (wordsBeforeCaret.length == 0) {
            return;
          }

          wordsBeforeCaret = wordsBeforeCaret.slice(0, wordsBeforeCaret.length - 1);

          const newTerm = `${wordsBeforeCaret.join(" ")}${stringAfterCaret}`;

          this.updateNewTermInternally(newTerm);
          this.updateTerm(newTerm);

          event.preventDefault();
        }
      }
    ];
  }

  /**
   * Update caret position
   * @param {*} position
   */
  updateCaret(position = -1) {
    logger.verbose("Updating caret position", { position });
    // Place the caret at the end of the element
    const target = findLastTextNode(this.input.current);
    // do not move caret if element was not focused
    const isTargetFocused = document.activeElement === this.input.current;
    if (target !== null && target.nodeValue !== null && isTargetFocused) {
      let range = document.createRange();
      let sel = window.getSelection();
      let offset = position > -1 ? position : target.nodeValue.length;
      if (offset > target.nodeValue.length) {
        offset = target.nodeValue.length;
      }
      range.setStart(target, offset);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      //if (el instanceof HTMLElement) el.focus();
    }

    // If the caretPositionBeforeBlur appeared, it means that the input might be un-focused now, any caret position updates should also update caretPositionBeforeBlur value. It will help the system getting the right caret position once the input getting focused again
    if (this.caretPositionBeforeBlur) {
      this.caretPositionBeforeBlur = position;
    }
  }

  /**
   * Check if cursor in the end of input
   *
   * @param  {DOMElement} input
   */
  caretInEndOfInput() {
    const caretPosition = this.getCurrentCaretPosition();
    return caretPosition >= this.input.current.textContent.length;
  }

  /**
   * Get current caret position
   */
  getCurrentCaretPosition() {
    if (!this.input) return -1;

    // input might lost focuse at the
    if (this.caretPositionBeforeBlur) return this.caretPositionBeforeBlur;

    const sel = window.getSelection();

    if (sel.rangeCount == 0) {
      return 0;
    }

    const range = sel.getRangeAt(0);
    return range.endOffset;
  }

  /**
   * Remove invalid characters
   * @param {*} term
   */
  normalizeSearchTerm(term) {
    return term.replace(/(\r\n\t|\n|\r\t)/gm, "");
  }

  onPaste(event) {
    event.preventDefault();
    const text = this.normalizeSearchTerm(event.clipboardData.getData("text"));

    document.execCommand("insertText", false, text);
    this.updateViewablePositionForCaret();
  }

  /**
   * Update viewable area position based on autocomplete
   */
  updateViewablePositionForAutocomplete() {
    if (this.displayer && this.inputWrapper) {
      this.inputWrapper.current.scrollLeft =
        this.displayer.current.clientWidth > this.inputWrapper.current.clientWidth
          ? this.displayer.current.clientWidth - this.inputWrapper.current.clientWidth
          : 0;
    }
  }

  /**
   * Update viewable area position based on caret
   */
  updateViewablePositionForCaret() {
    let clonedRange, offset, range, rect, shadowCaret;
    const sel = window.getSelection();
    if (sel.rangeCount == 0) {
      return;
    }

    range = sel.getRangeAt(0);

    if (range.endOffset - 1 > 0 && range.endContainer !== this.input.current) {
      clonedRange = range.cloneRange();
      clonedRange.setStart(range.endContainer, range.endOffset - 1);
      clonedRange.setEnd(range.endContainer, range.endOffset);
      rect = clonedRange.getBoundingClientRect();
      offset = {
        height: rect.height,
        left: rect.left + rect.width,
        top: rect.top
      };
      clonedRange.detach();
    }
    if (!offset || (offset != null ? offset.height : void 0) === 0) {
      clonedRange = range.cloneRange();
      shadowCaret = document.createTextNode("|");
      clonedRange.insertNode(shadowCaret);
      clonedRange.selectNode(shadowCaret);
      rect = clonedRange.getBoundingClientRect();
      offset = {
        height: rect.height,
        left: rect.left,
        top: rect.top
      };
      shadowCaret.remove();
      clonedRange.detach();
    }

    logger.verbose("Caret offset", { offset });

    // The offset left is relative, we need to convert it to the fix position first
    const offsetLeft = offset.left + this.inputWrapper.current.scrollLeft;

    if (offset && offsetLeft > this.inputWrapper.current.clientWidth) {
      this.inputWrapper.current.scrollLeft = offsetLeft - this.inputWrapper.current.clientWidth;
    }
  }

  /**
   * Dedicated logic to fire the text content change event from content editable div
   */
  emitChange() {
    this.lastText = this.input.current.textContent;
    //this.props.onChange(this.normalizeSearchTerm(this.input.current.textContent));
    this.updateTerm(this.normalizeSearchTerm(this.input.current.textContent));
  }

  /**
   * Update the caret position if the search term updated by external source
   * @param {*} prevCaretPosition
   * @param {*} prevTerm
   * @param {*} newTerm
   */
  updateCaretPositionForNewTerm(prevCaretPosition, prevTerm, newTerm) {
    // There are 2 scenarios,
    // 1. The newTerm is longer than the prevTerm, e.g: new term from autocomplete
    // 2. The newTerm is shorter than the prevTerm, e.g: new term from fast deletion

    let newCaretPosition = prevCaretPosition;

    if (newTerm.length > prevTerm.length) {
      newCaretPosition = prevCaretPosition + (newTerm.length - prevTerm.length);
    } else if (newTerm.length < prevTerm.length) {
      newCaretPosition = prevCaretPosition - (prevTerm.length - newTerm.length);
      newCaretPosition = newCaretPosition < 0 ? 0 : newCaretPosition;
    }

    logger.verbose("New caret position", { prevCaretPosition, newCaretPosition });

    this.updateCaret(newCaretPosition);
  }

  componentDidUpdate(prevProps) {
    // The search term changed by autocomplete action.
    if (this.input && this.input.current.textContent !== this.props.value) {
      this.updateNewTermInternally(this.props.value);
    }

    if (prevProps.autocomplete !== this.props.autocomplete) {
      // We need to display the autocomplete value when the value overflow input wrapper
      this.updateViewablePositionForAutocomplete();
    }

    // Trigger update term is auto search is required
    // DONOT remove this logic, it helps to trigger search for magic filter as well
    if (this.props.autoSearch) {
      this.updateTerm(this.props.value);
      return;
    }
  }

  updateNewTermInternally(newTerm) {
    const prevCaretPosition = this.getCurrentCaretPosition();

    const prevTerm = this.input.current.textContent;

    this.input.current.textContent = newTerm;

    this.updateCaretPositionForNewTerm(prevCaretPosition, prevTerm, newTerm);

    // We need to focus the caret with some logic
    this.updateViewablePositionForCaret();
  }

  focus() {
    if (this.input) {
      this.input.current.focus();
    }
  }

  onInputFocus(event) {
    const { onFocus } = this.props;

    if (this.caretPositionBeforeBlur) {
      this.updateCaret(this.caretPositionBeforeBlur);
      this.caretPositionBeforeBlur = null;
    }

    onFocus(event);
  }

  onInputBlur(event) {
    const { onBlur } = this.props;
    this.caretPositionBeforeBlur = this.getCurrentCaretPosition();
    onBlur(event);
  }

  highlight() {
    if (this.input && this.input.current) {
      const range = document.createRange();

      const textNode = (Array.from(this.input.current.childNodes).filter(childNode => {
        return childNode.textContent == this.input.current.textContent;
      }) || [])[0];

      if (textNode) {
        range.selectNodeContents(textNode);

        //range.setEnd(this.input.current.firstChild, this.input.current.textContent.length)

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  getAutocompletePaddingTerm() {
    // We only display the autocomplete if it's at the end of the term
    const { autocomplete, value } = this.props;

    logger.verbose("Getting autocomplete padding", { autocomplete, value });

    if (!autocomplete || !autocomplete.value) return;

    // TODO: improve the logic to suface the autocomplete padding part
    if (autocomplete.paddingPart && this.caretInEndOfInput()) return autocomplete.paddingPart;

    return;
  }

  /**
   * Search term through plugins with current user auth state
   * @param {string} event
   */
  updateTerm(event) {
    logger.info("Update term function called", event);

    this.props.searchActions.updateTerm(event, this.getCurrentCaretPosition());
  }

  render() {
    const { name, value, registerHotKeys, deregisterHotKeys, autocomplete } = this.props;
    const termParts = value.split(" ");
    const autocompletePaddingTerm = this.getAutocompletePaddingTerm();

    return (
      <div id="main-input-wrapper" className={styles.inputWrapper} ref={this.inputWrapper}>
        <div
          contentEditable={true}
          id="main-input"
          suppressContentEditableWarning={true}
          ref={this.input}
          className={styles.input}
          onInput={this.emitChange}
          onFocus={this.onInputFocus}
          onBlur={this.onInputBlur}
          textcontent={value}
          placeholder={`Hi, ${name ? name + ". W" : "w"}hat are you looking for?`}
          onPaste={this.onPaste}
        />

        <div className={styles.displayLayer} ref={this.displayer} id="main-input-displayer">
          {termParts &&
            termParts.map((termPart, i) => {
              return (
                <div
                  key={i}
                  className={cn(
                    styles.termPart,
                    chipiMagicFilterHelper.isMagicFilter(termPart) && styles.magicFilter
                  )}
                >
                  {i !== 0 && "\u00A0"}
                  {termPart}
                </div>
              );
            })}
          {autocompletePaddingTerm && (
            <div key="autocompletePart" className={cn(styles.termPart, styles.autocompletePart)}>
              {autocompletePaddingTerm}
            </div>
          )}
        </div>

        <ActionsBar
          actions={this.mainInputActions}
          registerHotKeys={registerHotKeys}
          deregisterHotKeys={deregisterHotKeys}
          isActivated={true}
          hotKeysCategory="mainInputActions"
          className="resultsListActions"
          invisible={true}
        />
      </div>
    );
  }
}

MainInput.propTypes = {
  value: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  name: PropTypes.string,
  autocomplete: PropTypes.object,
  registerHotKeys: PropTypes.func,
  deregisterHotKeys: PropTypes.func,
  searchActions: PropTypes.object,
  autoSearch: PropTypes.bool
};

export default MainInput;
