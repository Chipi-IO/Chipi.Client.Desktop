import { Component } from "react";
import PropTypes from "prop-types";

/**
 * Component that renders child function only after props.promise is resolved or rejected
 * You can provide props.loader that will be rendered before
 */
class Preload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
      error: null
    };
  }
  componentDidMount() {
    this.mounted = true;
    this.props.promise
      .then(result => {
        if (this.mounted) {
          this.setState({ result });
        }
      })
      .catch(error => {
        if (this.mounted) {
          this.setState({ error });
        }
      });
  }
  componentWillUnmount() {
    this.mounted = false;
  }
  render() {
    const { loader, children } = this.props;
    const { result, error } = this.state;
    if (result || error) {
      return children(result, error);
    }
    return loader || null;
  }
}

Preload.propTypes = {
  loader: PropTypes.element,
  children: PropTypes.func.isRequired,
  promise: PropTypes.shape({
    then: PropTypes.func,
    catch: PropTypes.func
  }).isRequired
};

export default Preload;
