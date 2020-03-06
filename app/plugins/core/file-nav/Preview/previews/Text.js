import React from 'react'
import PropTypes from 'prop-types'
import WithFetchedFile from './WithFetchedFile'
import styles from './styles/index.css'

const Text = ({ path }) => (
  <WithFetchedFile path={path}>
    {(source) => <pre className={styles.previewText}>{source}</pre>}
  </WithFetchedFile>
)

Text.propTypes = {
  path: PropTypes.string.isRequired,
}

export default Text
