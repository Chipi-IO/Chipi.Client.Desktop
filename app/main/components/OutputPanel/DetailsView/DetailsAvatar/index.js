import React from 'react';
import styles from './styles.css';
import cn from 'classnames';
import Avatar, { getRandomColor } from 'react-avatar';

const customColors = [
    '#5E005E',
    '#AB2F52',
    '#E55D4A',
    '#E88554',
    '#4194A6',
    '#82CCD9',
    '#FFCC6B',
    '#F2855C',
    '#7D323B'
];

export default function DetailsAvatar({ src, title, size=50 }) {
    return (src ?
        <Avatar src={src} round={true} size={size}/>
    : <Avatar name={title} round={true} color={getRandomColor([title], customColors)} size={size} textSizeRatio={2} />);
}
