import React, { Component } from 'react';
import { wc } from './webcomponent';

import { makeBins } from '@openchemistry/utils';
import { redYelBlu, gray, plasma, viridis } from '@openchemistry/utils';

import memoizeOne from 'memoize-one';

class Molecule extends Component {

  constructor(props) {
    super(props)

    if (props.cjson && props.cjson.vibrations && props.cjson.vibrations.eigenVectors) {
      this.state = {
        animation: {
          play: true,
          scale: 1,
          modeIdx: -1,
          nModes: props.cjson.vibrations.eigenVectors.length,
          framesPerPeriod: 15,
        }
      }
    } else {
      this.state = {
        animation: {
          play: false,
          scale: 1,
          modeIdx: -1,
          nModes: -1
        }
      }
    }

    this.state.isoSurfaces = this.isoSurfaces();

    this.state.menu = {
      open: false,
      anchorEl: null
    }

    this.state.volume = {
      opacity: [1, 0.75, 0, 0, 0.75, 1],
      colors: redYelBlu,
      mapName: 'Red Yellow Blue',
      range: [-0.1, 0.1],
      histograms: []
    }

    this.state.visibility = {
      isoSurfaces: true,
      volume: false
    }

    if (props.cjson.cube) {
      this.state.volume.histograms = makeBins(props.cjson.cube.scalars, 100);
    }

    this.state.splitDirection = "horizontal";
    this.updateSplitDirection = this.updateSplitDirection.bind(this);
    this.makeBins = memoizeOne(makeBins);
  }

  onAmplitude = (value) => {
    this.setState({
      animation: {...this.state.animation, ...{scale: value}}
    });
  }

  onModeChange = (value) => {
    this.setState({
      animation: {...this.state.animation, ...{modeIdx: value}}
    });
  }

  onPlayToggled = (value) => {
    this.setState({
      animation: {...this.state.animation, ...{play: value}}
    })
  }

  onIsoScale = (value) => {
    const isoSurfaces = this.isoSurfaces(value);
    this.setState({
      isoSurfaces: isoSurfaces
    })
  }

  onOpacitiesChanged = (value) => {
    this.setState({volume: {...this.state.volume, ...value}});
  }

  onVisibilityChanged = (value) => {
    this.setState({visibility: {...this.state.visibility, ...value}});
  }

  onColorMapChanged = (value) => {
    let colorMap;
    if (value === 'Plasma') {
      colorMap = plasma;
    } else if (value === 'Viridis') {
      colorMap = viridis;
    } else if (value === 'Red Yellow Blue') {
      colorMap = redYelBlu;
    } else if (value === 'Gray') {
      colorMap = gray;
    }
    
    this.setState({volume: {...this.state.volume, ...{colors: colorMap, mapName: value}}});
    
  }

  componentDidMount() {
    this.updateSplitDirection();
    window.addEventListener('resize', this.updateSplitDirection);
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSplitDirection);
  }
  
  updateSplitDirection() {
    let dir = window.innerWidth / window.devicePixelRatio > 800 ? 'horizontal' : 'vertical';
    if (dir !== this.state.splitDirection) {
      this.setState({splitDirection: dir});
    }
  }

  render() {
    const animation = this.state.animation;
    const hasVolume = !!this.props.cjson && !!this.props.cjson.cube;
    const hasAnimation = !!animation;
    const hasSpectrum = !!this.props.cjson && !!this.props.cjson.vibrations && !!this.props.cjson.vibrations.frequencies;
    const nModes = hasSpectrum ? this.props.cjson.vibrations.frequencies.length : -1;
    const n = hasSpectrum ? 2 : 2;
    const sizes = hasSpectrum ? "0.4, 0.6" : "1, 0";
    const fixSplit = !hasSpectrum;
    let histograms;
    if (this.props.cjson.cube) {
      histograms = this.makeBins(this.props.cjson.cube.scalars);
    }

    return (
      <div>
        <div style={{width: "100%", height: "40rem", position: "relative"}}>
          <split-me n={n} d={this.state.splitDirection} sizes={sizes} fixed={fixSplit}>
            <div slot="0" style={{width: "100%", height: "100%"}}>
              <oc-molecule-vtkjs
                ref={wc(
                  // Events
                  {},
                  // Props
                  {
                    cjson: this.props.cjson,
                    options: {
                      isoSurfaces: this.state.isoSurfaces,
                      normalMode: animation,
                      visibility: this.state.visibility,
                      volume: {
                        colors: this.state.volume.colors,
                        opacity: this.state.volume.opacity,
                        opacityScalarValue: this.state.volume.opacityScalarValue,
                        range: this.state.volume.range,
                      }
                    },
                  })
                }
              />
            </div>
            <div slot="1" style={{width: "100%", height: "100%"}}>
              { hasSpectrum &&
              <oc-vibrational-spectrum
                ref={wc(
                  // Events
                  {barSelected: (e)=>{this.onModeChange(e.detail);}},
                  // Props
                  {
                    vibrations: this.props.cjson.vibrations,
                    options: animation
                  })
                }
              />
              }
            </div>
          </split-me>
          { (hasAnimation || hasVolume || this.props.orbitalControls) &&
          <div style={{position: "absolute", right: 0, top: 0, width: '100%'}}>
            <oc-molecule-menu-popup>
              <oc-molecule-menu
                ref={wc(
                  // Events
                  {
                    scaleValueChanged: (e)=>{this.onAmplitude(e.detail);},
                    isoValueChanged: (e) => {this.onIsoScale(e.detail);},
                    normalModeChanged: (e) => {this.onModeChange(e.detail);},
                    playChanged: (e) => {this.onPlayToggled(e.detail);},
                    opacitiesChanged: (e) => {this.onOpacitiesChanged(e.detail);},
                    visibilityChanged: (e) => {this.onVisibilityChanged(e.detail);},
                    colorMapChanged: (e) => {this.onColorMapChanged(e.detail);}
                  },
                  // Props
                  {
                    nModes: nModes,
                    iMode: Math.min(animation.modeIdx, nModes - 1),
                    scaleValue: animation.scale,
                    play: animation.play,
                    hasVolume: hasVolume,
                    isoValue: this.state.isoSurfaces[0].value,
                    volumeOptions: {
                      colors: this.state.volume.colors,
                      opacity: this.state.volume.opacity,
                      opacityScalarValue: this.state.volume.opacityScalarValue,
                      range: this.state.volume.range,
                      histograms: histograms
                    },
                    visibilityOptions: this.state.visibility,
                    colorMaps: ['Red Yellow Blue', 'Viridis', 'Plasma', 'Gray'],
                    activeMap: this.state.volume.mapName
                  })
                }
                ></oc-molecule-menu>
            </oc-molecule-menu-popup>
          </div>
          }
        </div>
      </div>
    );
  }

  isoSurfaces(iso = 0.005) {
    return [{
      value: iso,
      color: 'blue',
      opacity: 0.9,
    }, {
      value: -iso,
      color: 'red',
      opacity: 0.9
    }
    ];
  }

}

Molecule.defaultProps = {
  cjson: null,
}

export default Molecule
