import React, { ReactText } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import slid from "./slide"
import fade from "./fade"
import flip from "./flip"

export type AvailableTransitions = typeof slid | typeof fade | typeof flip

export interface ITransition {
  transitionClassName: string,
  duration: number
}

// the childFactory allows to change the transition of the leaving component
// https://github.com/reactjs/react-transition-group/issues/182
const childFactoryCreator = props => child => React.cloneElement(child, props);

export interface ITransitionProps {
  transition: ITransition;
  duration: number;
  pageKey: ReactText;
  children: any;
}

class Transition extends React.Component<ITransitionProps, any> {

  render() {
    const { pageKey, children} = this.props;
    let {transition} = this.props;

    transition = transition ? transition : fade;
    
    return (<TransitionGroup
      childFactory={childFactoryCreator({
        classNames: transition.transitionClassName,
        timeout: transition.duration
      })}
    >
      <CSSTransition key={pageKey} timeout={transition.duration}>
        {/* you should wrap CSSTransition child in a div in case it could be null
          see https://github.com/reactjs/react-transition-group/issues/208 */}
        <div>{children}</div>
      </CSSTransition>
    </TransitionGroup>)
  }
  
};


export default Transition;
