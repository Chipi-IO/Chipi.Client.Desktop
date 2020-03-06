import React, { Component } from 'react'
import PropTypes from "prop-types";
import Logger from '../../../../../lib/logger'
import styles from './styles.css'
import Loading from '../../../Loading'

const logger = new Logger('components.OutputPanel.DetailsView.PreviewContent')

class PreviewContent extends Component {
    constructor(props) {
        super(props)

        this.state = {
            previewContent: null
        }
    }

    componentDidMount() {
        const { previewItem } = this.props

        if (previewItem && previewItem.getPreview) {
            logger.verbose('Preview content mounted and get preview function defined');
            const getPreviewTaskResult = previewItem.getPreview();

            if (getPreviewTaskResult && (typeof getPreviewTaskResult.then === 'function')) {
                getPreviewTaskResult.then(previewContent => {
                    this.setState({
                        previewContent
                    })
                })
            }
            else {
                this.setState({
                    previewContent: getPreviewTaskResult
                })
            }
        }
        else if (previewItem) {
            const previewContent = <div>{previewItem.title}</div>
            this.setState({
                previewContent: previewContent
            })
        }
    }

    render() {
        const { previewItem } = this.props;
        const { previewContent } = this.state;

        if (!previewItem) {
            return (<div></div>)
        }

        return (
            <div className={styles.previewContent}>
                {!previewContent && <Loading />}
                {previewContent}
            </div>
        );
    }
}

export default PreviewContent