#version 450
precision mediump float;

uniform float time;
uniform float resolutionWidth;
uniform float resolutionHeight;

uniform sampler2D firstPassTexture;
const float PI = 3.14;

vec4 _gl_Position;
#define gl_Position _gl_Position

#pragma attributes

vec3 aPosition;
vec2 aUV;

#pragma varyings

vec3 vColor;
vec2 vUV;

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

vec4 colorize () {
	return vec4(palette(vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 1.0, 2.0) / 3.0, floor(beat / 8.0) * 0.1), 1.);
}

mat2 rot(float a) {
	float c = cos(a), s = sin(a);
	return mat2(c, - s, s, c);
}

vec3 curve(float ratio) {
	ratio *= 10.;
	ratio += time;
	vec3 position = vec3(0.5 + 0.3 * sin(ratio), 0, 0);
	position.xz *= rot(ratio);
	position.yz *= rot(ratio * 1.58);
	position.yx *= rot(ratio * 1.5);
	position.xz *= rot(time * .1);
	position.x /= resolutionWidth/resolutionHeight;
	return position;
}

// RIBBONS

#pragma vertex 0

void mainV0() {
	vec3 position = aPosition;
	float ratio = aUV.x * 0.5 + .5;
	float size = .03;
	position = curve(ratio);
	vec3 next = curve(ratio + 0.01);
	vec2 y = normalize(next.xy - position.xy);
	vec2 x = vec2(y.y, - y.x);
	position.xy += size * x * aUV.y * vec2(resolutionHeight/resolutionWidth, 1);
	position.xy /= 1.+position.z;
	gl_Position = vec4(position, 1.0);
	vColor = position;
}

#pragma fragment 0

void mainF0() {
	color = colorize();// * (1.-(vColor.z+1.)/ 2.);
}

// PARTICLES

#pragma vertex 1

void mainV1() {
	vec3 position = curve(0.0);
	vec2 aspectRatio = vec2(resolutionHeight/resolutionWidth, 1);
	float fall = fract(time * .1 + aPosition.y);
	float size = (0.01 + 0.005 * sin(aPosition.y*8654.567)) * smoothstep(1.0, 0.9, fall);
	float a = sin(aPosition.y * 135734.2657) * TAU;
	float r = sin(aPosition.y * 687451.5767) * 0.2;
	vec2 offset = vec2(cos(a),sin(a)+4.) * aspectRatio * r * 4.0;
	position = curve(-fall);
	position.y -= 5.0 * fall;
	position.xy -= offset * fall + vec2(cos(a),sin(a)) * 0.02;
	position.xy += size * aUV.xy * aspectRatio;
	position.xy /= 1.+position.z;
	gl_Position = vec4(position, 1.0);
	vColor = vec3(aUV.xy * 0.5 + 0.5, 0);
	vUV = aUV;
}

#pragma fragment 1

void mainF1() {
	float d =  length(vUV);
	if (d > 1.) discard;
	color = colorize();
}

// POST FX

#pragma fragment 2

void mainF2() {
	float aspectRatio = resolutionWidth / resolutionHeight;
	float beat = time * 2.08333;// BPS
	
	vec2 uvc = gl_FragCoord.xy / vec2(resolutionWidth, resolutionHeight) - 0.5;
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

	// outline
	#if 1
	color = .5*texture(firstPassTexture, uv+vec2(0.01));
	vec4 frame = texture(firstPassTexture, uv);
	float gray = (frame.r+frame.g+frame.b)/3.0;
	color = mix(color, frame, step(0.1, gray));
	#endif
	
	color.a = 1.0;
}
