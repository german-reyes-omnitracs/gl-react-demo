import {GLSL, Node, Shaders} from 'gl-react';
import {Surface} from 'gl-react-native';
import React, {useState} from 'react';
import {
  Button,
  Image,
  SafeAreaView,
  ScrollView,
  Slider,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const shaders = Shaders.create({
  Saturate: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float contrast, saturation, brightness;
const vec3 L = vec3(0.2125, 0.7154, 0.0721);
void main() {
  vec4 c = texture2D(t, uv);
	vec3 brt = c.rgb * brightness;
	gl_FragColor = vec4(mix(
    vec3(0.5),
    mix(vec3(dot(brt, L)), brt, saturation),
    contrast), c.a);
}`,
  },
});

const imageWidth = 450;
const imageUrl =
  'https://media.cheggcdn.com/study/224/2241f340-6d5a-42fb-b50a-d0487763bb7e/image.png';

export const Saturate = ({contrast, saturation, brightness, children}) => (
  <Node
    shader={shaders.Saturate}
    uniforms={{contrast, saturation, brightness, t: children}}
  />
);

export const FilterSlider = ({name, minimum, maximum, onChange, value = 1}) => (
  <View style={styles.container}>
    <Text style={styles.text}>{name}</Text>
    <Slider
      style={styles.slider}
      value={value}
      minimumValue={minimum}
      maximumValue={maximum}
      onValueChange={onChange}
      step={0.05}
    />
  </View>
);

export const OriginalImage = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.text}>Original Image</Text>
      <Surface style={{width: imageWidth, height: (imageWidth * 300) / 250}}>
        <Saturate contrast={1} saturation={1} brightness={1}>
          {{
            uri: imageUrl,
          }}
        </Saturate>
      </Surface>
    </View>
  );
};

export const PresetsImage = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.text}>Image with defined presets</Text>
      <Text>Contrast = 1.5, Saturation = 0, Brigthness=1.75</Text>
      <Surface style={{width: imageWidth, height: (imageWidth * 300) / 250}}>
        <Saturate contrast={1.5} saturation={0} brightness={1.75}>
          {{
            uri: imageUrl,
          }}
        </Saturate>
      </Surface>
    </View>
  );
};

export const SlidersImage = ({
  contrast: propContrast = 1,
  saturation: propSaturation = 1,
  brightness: propBrightness = 1,
}) => {
  const surfaceRef = React.createRef();
  const [contrast, setContrast] = useState(propContrast);
  const [saturation, setSaturation] = useState(propSaturation);
  const [brightness, setBrightness] = useState(propBrightness);
  const [newImage, setNewImage] = useState(null);

  return (
    <View style={styles.section}>
      <Text style={styles.text}>Playing with sliders</Text>
      <Surface
        ref={surfaceRef}
        style={{width: imageWidth, height: (imageWidth * 300) / 250}}>
        <Saturate
          contrast={contrast}
          saturation={saturation}
          brightness={brightness}>
          {{
            uri: imageUrl,
          }}
        </Saturate>
      </Surface>
      <FilterSlider
        name={'Contrast'}
        minimum={0}
        maximum={2}
        onChange={value => {
          setContrast(value);
        }}
      />
      <FilterSlider
        name={'Saturation'}
        minimum={0}
        maximum={2}
        onChange={value => {
          setSaturation(value);
        }}
      />
      <FilterSlider
        name={'Brigthness'}
        minimum={0}
        maximum={2}
        onChange={value => {
          setBrightness(value);
        }}
      />
      <Button
        title="SAVE AND SHOW NEW IMAGE"
        onPress={async () => {
          const res = await surfaceRef.current.glView.capture();
          console.log(res.uri);
          setNewImage(res.uri);
        }}
      />
      {newImage && (
        <>
          <Text style={styles.text}>Saved new image</Text>
          <Image
            source={{uri: newImage}}
            style={{width: imageWidth, height: (imageWidth * 300) / 250}}
          />
        </>
      )}
    </View>
  );
};

const App = () => {
  return (
    <SafeAreaView>
      <ScrollView>
        <OriginalImage />
        <PresetsImage />
        <SlidersImage />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 300,
    paddingLeft: 20,
  },
  text: {textAlign: 'center', fontWeight: 'bold', marginTop: 7, fontSize: 18},
  slider: {width: 150},
  section: {marginVertical: 35},
  divider: {width: '100%', height: '4'},
});

export default App;
