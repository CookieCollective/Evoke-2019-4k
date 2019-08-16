#version 450
precision mediump float;

uniform float time;
uniform float resolutionWidth;
uniform float resolutionHeight;

uniform sampler2D firstPassTexture;

vec4 _gl_Position;
#define gl_Position _gl_Position

#pragma attributes

vec3 aPosition;
vec2 aUV;

#pragma varyings

vec3 vColor;

#pragma outputs

vec4 color;

#pragma common

// TODO move
const float TAU = 6.28;
float beat = time * 2.08333;// BPS

float md(float p, float m) {
	return mod(p - m*0.5, m) - m*0.5;
}

void amod(inout vec2 p, float d) {
	float a = md(atan(p.y, p.x), TAU / d);
	p = vec2(cos(a), sin(a)) * length(p);
}

void amodm(inout vec2 p, float d) {
	float a = abs(md(atan(p.y, p.x), TAU / d));
	p = vec2(cos(a), sin(a)) * length(p);
}

vec3 palette(vec3 a, vec3 b, vec3 c, vec3 d, float t) {
	return a + b * cos(TAU * (c * t + d));
}

mat2 rot(float a) {
	float c = cos(a), s = sin(a);
	return mat2(c, - s, s, c);
}

vec3 curve(float ratio) {
	ratio += time;
	vec3 position = vec3(0.5 + 0.3 * sin(ratio), 0, 0);
	position.xz *= rot(ratio);
	position.yz *= rot(ratio * 0.58);
	position.yx *= rot(ratio * 1.5);
	return position;
}

#pragma vertex 0

void mainV0() {
	vec3 position = aPosition;
	float ratio = aUV.x * 0.5 + position.x * 2.0;
	float i = position.x;
	position = curve(ratio);
	vec3 next = curve(ratio + 0.01);
	vec2 y = normalize(next.xy - position.xy);
	vec2 x = vec2(y.y, - y.x);
	position.xy += x * aUV.y * (0.01 + 0.01 * position.z);
	gl_Position = vec4(position.xy, 0.0, 1.0);
	vColor = vec3(aUV.xy * 0.5 + 0.5, 0);
}

#pragma fragment 0

void mainF0() {
	float fade = smoothstep(0.0, 0.5, vColor.x);
	fade *= (1.0 - abs(vColor.x * 2.0 - 1.0));
	color = vec4(palette(vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 1.0, 2.0) / 3.0, floor(beat / 8.0) * 0.1), fade);
}

#pragma fragment 1

void mainF1() {
	float aspectRatio = 360.0 / 240.0;
	
	vec2 uvc = gl_FragCoord.xy / vec2(360.0, 240.0) - 0.5;
	uvc.x *= aspectRatio;
	
	vec2 st = uvc * 40.0, fst = fract(st), ist = floor(st);
	vec2 wp = ist + step(0.5, fst), bp = ist + vec2(0.5);
	float wl = length(st - wp), bl = length(st - bp);
	float halftone = step(sin(beat * TAU / 4.0) * 0.45, bl / (bl + wl) - 0.5);
	
	// A mod kaleidoscope.
	#if 0
	amodm(uvc, floor(fract(sin(floor(beat / 4.0)) * 1e3) * 5.0) + 1.0);
	#endif
	vec2 uv = uvc / vec2(aspectRatio, 1) + 0.5;
	
	// Chromatic aberration.
	#if 0
	for(int i = 0; i < 3; ++ i)
	{
		color[i] = texture(firstPassTexture, (uv - 0.5) * (1.0 + exp(-fract(beat / 4.0)) * (0.01 + float(i) * 0.01)) + 0.5)[i];
	}
	color.a = texture(firstPassTexture, uv).a;
	
	#else
	color = texture(firstPassTexture, uv);
	#endif
	
	// Halftone.
	#if 0
	color = mix(color, 1.0 - color, halftone);
	#endif
	
	color.a = 1.0;
}
