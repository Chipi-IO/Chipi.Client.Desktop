import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom';
import cn from 'classnames'
import Loading from '../../components/Loading';
import styles from './styles.css'
import { ipcRenderer } from 'electron';

function SentimentButton({ value, children, selectedSentiment, onSentimentClick }) {
  return (
    <button
      type="button"
      value={value}
      className={cn(styles.sentimentButton, selectedSentiment === value && styles.selectedSentimentButton)}
      onClick={onSentimentClick}
    >
      {children}
    </button>
  )
}

class Feedback extends PureComponent {
  constructor() {
    super()
    this.onSentimentClick = this.onSentimentClick.bind(this)
    this.onCancelClick = this.onCancelClick.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onKeyPressed = this.onKeyPressed.bind(this)
    this.state = {
      isSubmitting: false,
      isSubmitted: false,
      sentiment: null,
      isInvalid: false
    }
  }

  onSentimentClick(e) {
    const currentSentiment = this.state.sentiment;
    const sentiment = e.target.value;

    const nextSentiment = (currentSentiment === sentiment) ? null : sentiment

    this.setState({ sentiment: nextSentiment }, () => {
      if (nextSentiment !== null) {
        this._textarea && this._textarea.focus();
      }
    })
  }

  onCancelClick() {
    window.close();
  }

  onSubmit(e) {
    e.preventDefault()
    const message = this._textarea.value
    const { sentiment } = this.state;

    if (message.length === 0 || sentiment == null) {
      this.setState({ isInvalid: true })
    } else {
      const payload = {
        message,
        sentiment
      }

      this.setState({ isSubmitting: true, isInvalid: false })
      console.log('Sending feedback');
      ipcRenderer.send('sendFeedback', JSON.stringify(payload))

      // TODO: Show error if this fails. This is an optimistic lie.
      // It will fail if the user is not signed in.
      setTimeout(() => {
        this.setState({ isSubmitting: false, isSubmitted: true });
      }, 200);
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  onKeyPressed(event) {
    const keyActions = {
      escape: () => {
        this.onCancelClick()
      }
    };

    switch (event.keyCode) {
      case 27:
        keyActions.escape()
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyPressed, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyPressed, false);
  }

  render() {
    const { sentiment, isSubmitted, isSubmitting, isInvalid } = this.state
    const hiddenIfNoSentimentClass = !sentiment && styles.hidden;

    const component = isSubmitting ? <div className={styles.wrapper}><Loading /></div> :
      (isSubmitted ? (
        <div className={styles.wrapper}>
          Thanks for your feedback!
          <div className={styles.buttons}>
            <button autoFocus className={cn(styles.cancel, !sentiment && styles.buttonGrow)} type="button" onClick={this.onCancelClick}>Close</button>
          </div>
        </div>
      ) : (
          <div className={styles.wrapper}>
            <div>How did CHIPI make you feel?</div>
            <div className={styles.sentiments}>
              <SentimentButton value="happy" selectedSentiment={sentiment} onSentimentClick={this.onSentimentClick}>😀</SentimentButton>
              <SentimentButton value="neutral" selectedSentiment={sentiment} onSentimentClick={this.onSentimentClick}>😐</SentimentButton>
              <SentimentButton value="angry" selectedSentiment={sentiment} onSentimentClick={this.onSentimentClick}>😡</SentimentButton>
            </div>
            <label className={cn(styles.label, hiddenIfNoSentimentClass)}>
              <span className={styles.labelText}>Please tell us why:</span>
              <textarea className={styles.textarea} ref={c => { this._textarea = c }} />
            </label>
            {isInvalid && <div className={styles.invalidMessage}>Please add a comment</div>}
            <div className={styles.buttons}>
              <button
                className={cn(styles.submit, hiddenIfNoSentimentClass)}
                type="submit"
                onClick={this.onSubmit}
              >
                Send feedback
              </button>
              <button className={cn(styles.cancel, !sentiment && styles.buttonGrow)} type="button" onClick={this.onCancelClick}>Cancel</button>
            </div>
          </div>
        )
      )

    return (
      <form className={styles.page}>
        {component}
      </form>
    )
  }
}

ReactDOM.render(<Feedback />, document.getElementById('root'));
