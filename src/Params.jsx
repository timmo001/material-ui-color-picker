import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import TextField from '@material-ui/core/TextField';

import Color from './helpers/color';
import percentage from './helpers/percentage';

const modesMap = ['RGB', 'HSB'];

export default class Params extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: props.mode,
      hex: props.color.hex,
      color: props.color, // instanceof tinycolor
    };
  }

  componentWillReceiveProps(nextProps) {
    const { color: nextColor } = nextProps;

    this.setState({
      color: nextColor,
      hex: nextColor.hex,
    });
  }

  getChannelInRange = (value, index) => {
    const channelMap = {
      RGB: [[0, 255], [0, 255], [0, 255]],
      HSB: [[0, 359], [0, 100], [0, 100]],
    };
    const mode = this.state.mode;
    const range = channelMap[mode][index];
    let result = parseInt(value, 10);
    if (isNaN(result)) {
      result = 0;
    }
    result = Math.max(range[0], result);
    result = Math.min(result, range[1]);
    return result;
  };

  getPrefixCls = () => {
    return `${this.props.rootPrefixCls}-params`;
  };

  handleHexBlur = () => {
    const hex = this.state.hex;

    let color = null;

    if (Color.isValidHex(hex)) {
      color = new Color(hex);
    }

    if (color !== null) {
      this.setState({
        color,
        hex,
      });
      this.props.onChange(color, false);
    }
  };

  handleHexPress = event => {
    const hex = this.state.hex;
    if (event.nativeEvent.which === 13) {
      let color = null;

      if (Color.isValidHex(hex)) {
        color = new Color(hex);
      }

      if (color !== null) {
        this.setState({
          color,
          hex,
        });
        this.props.onChange(color, false);
      }
    }
  };

  handleHexChange = event => {
    const hex = event.target.value;

    this.setState({
      hex,
    });
  };

  handleModeChange = () => {
    let mode = this.state.mode;

    const modeIndex = (modesMap.indexOf(mode) + 1) % modesMap.length;

    mode = modesMap[modeIndex];

    this.setState({
      mode,
    });
  };

  handleAlphaHandler = event => {
    let alpha = parseInt(event.target.value, 10);

    if (isNaN(alpha)) {
      alpha = 0;
    }
    alpha = Math.max(0, alpha);
    alpha = Math.min(alpha, 100);

    this.props.onAlphaChange(alpha);
  };

  updateColorByChanel = (channel, value) => {
    const { color } = this.props;
    const { mode } = this.state;

    if (mode === 'HSB') {
      if (channel === 'H') {
        color.hue = parseInt(value, 10);
      } else if (channel === 'S') {
        color.saturation = parseInt(value, 10) / 100;
      } else if (channel === 'B') {
        color.brightness = parseInt(value, 10) / 100;
      }
    } else {
      if (channel === 'R') {
        color.red = parseInt(value, 10);
      } else if (channel === 'G') {
        color.green = parseInt(value, 10);
      } else if (channel === 'B') {
        color.blue = parseInt(value, 10);
      }
    }

    return color;
  };

  handleColorChannelChange = (index, event) => {
    const value = this.getChannelInRange(event.target.value, index);
    const { mode } = this.state;
    const channel = mode[index];

    const color = this.updateColorByChanel(channel, value);

    this.setState(
      {
        hex: color.hex,
        color,
      },
      () => {
        this.props.onChange(color, false);
      }
    );
  };

  render() {
    const prefixCls = this.getPrefixCls();

    const { enableAlpha } = this.props;
    const { mode, color } = this.state;
    const colorChannel = color[mode];

    if (mode === 'HSB') {
      colorChannel[0] = parseInt(colorChannel[0], 10);
      colorChannel[1] = percentage(colorChannel[1]);
      colorChannel[2] = percentage(colorChannel[2]);
    }

    const paramsClasses = cx({
      [prefixCls]: true,
      [`${prefixCls}-has-alpha`]: enableAlpha,
    });

    return (
      <div className={paramsClasses}>
        <div className={`${prefixCls}-input`}>
          <TextField
            id="hex"
            label="Hex"
            className={`${prefixCls}-hex`}
            value={this.state.hex.toLowerCase()}
            onKeyPress={this.handleHexPress}
            onBlur={this.handleHexBlur}
            onChange={this.handleHexChange}
            InputProps={{
              type: 'text',
              maxLength: 6,
            }} />
          <div>
            <TextField
              id="channel_0"
              label={mode[0]}
              className={`${prefixCls}-number`}
              value={colorChannel[0]}
              onChange={this.handleColorChannelChange.bind(null, 0)}
              InputProps={{
                type: 'number',
              }} />
            <TextField
              id="channel_1"
              label={mode[1]}
              className={`${prefixCls}-number`}
              value={colorChannel[1]}
              onChange={this.handleColorChannelChange.bind(null, 1)}
              InputProps={{
                type: 'number',
              }} />
            <TextField
              id="channel_2"
              label={mode[2]}
              className={`${prefixCls}-number`}
              value={colorChannel[2]}
              onChange={this.handleColorChannelChange.bind(null, 2)}
              InputProps={{
                type: 'number',
              }} />
            {enableAlpha &&
              <TextField
                label="A"
                className={`${prefixCls}-alpha`}
                value={Math.round(this.props.alpha)}
                onChange={this.handleAlphaHandler}
                InputProps={{
                  type: 'number',
                }} />
            }
          </div>
        </div >
      </div >
    );
  }
}

Params.propTypes = {
  alpha: PropTypes.number,
  enableAlpha: PropTypes.bool,
  color: PropTypes.object.isRequired,
  mode: PropTypes.oneOf(modesMap),
  onAlphaChange: PropTypes.func,
  onChange: PropTypes.func,
  rootPrefixCls: PropTypes.string,
};

Params.defaultProps = {
  mode: modesMap[0],
  enableAlpha: true,
};