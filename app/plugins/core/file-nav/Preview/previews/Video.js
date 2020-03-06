import React from 'react'
import PropTypes from 'prop-types'
import FileDetails from '../FileDetails'
import styles from './styles/index.css'

const Video = ({ path }) => (
  <div className={styles.previewVideo}>
    <video src={path} controls="true" />
    <FileDetails path={path} />
  </div>
)

Video.propTypes = {
  path: PropTypes.string.isRequired
}

export default Video
