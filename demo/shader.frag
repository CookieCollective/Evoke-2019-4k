#version 450
precision mediump float;

uniform float time;
uniform float resolutionWidth;
uniform float resolutionHeight;

uniform sampler2D firstPassTexture;
const float PI = 3.14;
const float fallAt = 0.5;
const float startAt = 20.6;
const float continueAt = 41.8;
const float moreAt = 61.4;
const float textAt = 82;

vec4 _gl_Position;
#define gl_Position _gl_Position

#pragma attributes

vec3 aPosition;
vec2 aUV;

#pragma varyings

vec2 vUV;

#pragma outputs

vec4 color;

#pragma common

// TODO move
const float TAU = 6.28;
float beat = time * 0.78;// BPS

vec4 colorize() {
	return vec4(vec3(0.5) + vec3(0.5) * cos(TAU * (floor(beat) * 0.1 * vec3(1.0) + vec3(0.0, 1.0, 2.0) / 3.0)), 1.0);
}

mat2 rot(float a) {
	float c = cos(a), s = sin(a);
	return mat2(c, - s, s, c);
}

vec2 cs(float a) { return vec2(cos(a), sin(a)); }

vec2 evoke(float t) {
	return vec2((vec2(cs(3.142)) * 0.114 + vec2(cs(t - 1.463)) * 0.303 + vec2(cs(t * 2.0 - 1.036)) * 0.129 + vec2(cs(t * 3.0 - 1.298)) * 0.067 + vec2(cs(t * 4.0 - 1.529)) * 0.075 + vec2(cs(t * 5.0 - 1.22)) * 0.038 + vec2(cs(t * 6.0 - 1.022)) * 0.033 + vec2(cs(t * 7.0 - 2.835)) * 0.021 + vec2(cs(t * 8.0 - 1.337)) * 0.030 + vec2(cs(t * 9.0 - 1.765)) * 0.033 + vec2(cs(t * 10.0 - 1.531)) * 0.026 + vec2(cs(t * 11.0 - 2.48)) * 0.028 + vec2(cs(t * 12.0 - 1.821)) * 0.006 + vec2(cs(t * 13.0 - 2.018)) * 0.017 + vec2(cs(t * 14.0 - 2.405)) * 0.012).x, (vec2(cs(3.142)) * 0.100 + vec2(cs(t + 0.117)) * 0.074 + vec2(cs(t * 2.0 + 1.023)) * 0.08 + vec2(cs(t * 3.0 + 0.659)) * 0.06 + vec2(cs(t * 4.0 + 0.123)) * 0.022 + vec2(cs(t * 5.0 + 0.804)) * 0.049 + vec2(cs(t * 6.0 - 0.15)) * 0.029 + vec2(cs(t * 7.0 + 1.095)) * 0.019 + vec2(cs(t * 8.0 + 0.555)) * 0.022 + vec2(cs(t * 9.0 + 0.169)) * 0.058 + vec2(cs(t * 10.0 - 0.712)) * 0.014 + vec2(cs(t * 11.0 + 0.468)) * 0.013 + vec2(cs(t * 12.0 - 0.193)) * 0.036 + vec2(cs(t * 13.0 - 1.541)) * 0.005 + vec2(cs(t * 14.0 - 1.486)) * 0.008).x);
}

vec2 cookie(float t) {
	return vec2((vec2(1, 0) * 0.079 + vec2(cs(t - 1.581)) * 0.231 + vec2(cs(t * 2.0 - 1.237)) * 0.138 + vec2(cs(t * 3.0 - 1.122)) * 0.088 + vec2(cs(t * 4.0 - 0.759)) * 0.062 + vec2(cs(t * 5.0 - 0.595)) * 0.049 + vec2(cs(t * 6.0 + 0.560)) * 0.026 + vec2(cs(t * 7.0 - 2.733)) * 0.026 + vec2(cs(t * 8.0 - 1.255)) * 0.022 + vec2(cs(t * 9.0 - 1.442)) * 0.017 + vec2(cs(t * 10.0 - 2.092)) * 0.029 + vec2(cs(t * 11.0 - 2.179)) * 0.010 + vec2(cs(t * 12.0 - 1.91)) * 0.02 + vec2(cs(t * 13.0 - 2.932)) * 0.006 + vec2(cs(t * 14.0 + 3.008)) * 0.009).x, (vec2(cs(3.142)) * 0.049 + vec2(cs(t + 0.353)) * 0.058 + vec2(cs(t * 2.0 + 0.537)) * 0.093 + vec2(cs(t * 3.0 + 0.438)) * 0.033 + vec2(cs(t * 4.0 + 1.024)) * 0.074 + vec2(cs(t * 5.0 - 0.037)) * 0.004 + vec2(cs(t * 6.0 + 0.386)) * 0.032 + vec2(cs(t * 7.0 - 1.484)) * 0.018 + vec2(cs(t * 8.0 - 3.057)) * 0.018 + vec2(cs(t * 9.0 - 0.387)) * 0.070 + vec2(cs(t * 10.0 - 0.394)) * 0.028 + vec2(cs(t * 11.0 - 0.027)) * 0.044 + vec2(cs(t * 12.0 - 2.075)) * 0.024 + vec2(cs(t * 13.0 - 1.341)) * 0.007 + vec2(cs(t * 14.0 - 0.674)) * 0.011).x);
}

vec3 curve(float ratio) {
	float tt = beat;
	float ttt = 0.0;
	if (time < textAt) {
		if (time > startAt) {
			ttt += floor(beat) * 5.246;
			tt = smoothstep(0, fallAt + 0.15, fract(beat));
			ratio *= (4 + tt * 9);
			ratio += ttt;
		} else {
			ratio += tt;
		}
	}
	
	float radius = 0.5 + (time > continueAt ? 0.5 : 0.15) * sin(ratio);
	
	vec3 position = vec3(radius, 0, 0);
	position.xz *= rot(ttt + ratio * 1.96 * (time > moreAt ? 3:1));
	position.yz *= rot(ttt + ratio * 1.58 * (time > moreAt ? 4:1));
	position.yx *= rot(ttt + ratio * 1.5 * (time > moreAt ? 2:1));
	
	// if (time > continueAt) {
		// 	position.xz *= rot(tt * 1.5 + ttt);
		// 	position.yz *= rot(-tt * 2.0 + ttt);
	// }
	
	if (time > textAt) {
		float round = mod(floor(max(0.0, time - textAt) * 0.78), 2.0);
		if (round < 0.5)position = vec3((cookie((1 - ratio) * TAU)) * 2, 0);
		else position = vec3((evoke((1 - ratio) * TAU)) * 2, 0);
		// vec3 txt1 = vec3((evoke((1-ratio)*TAU)) * 2, 0);
		// txt1.xz *= rot(time);
		// txt1.yz *= rot(time);
	}
	
	position.x /= resolutionWidth / resolutionHeight;
	return position;
}

float halftone(vec2 st, float dir) {
	vec2 fst = fract(st), ist = floor(st), wp = ist + step(0.5, fst), bp = ist + vec2(0.5);
	float wl = length(st - wp), bl = length(st - bp);
	return step(dir, bl / (bl + wl));
}

float floors(float x) {
	return floor(x) + smoothstep(0.9, 1.0, fract(x));
}

// RIBBONS

#pragma vertex 0

void mainV0() {
	vec3 position = aPosition;
	float ratio = aUV.x * 0.5 + 0.5;
	if (time > startAt)ratio *= smoothstep(0.0, fallAt, fract(beat));
	float size = 0.02;
	float fall = smoothstep(fallAt, 1.0, fract(beat));
	if (time > startAt)size *= smoothstep(0.1, 0.0, fall);
	position = curve(ratio);
	vec3 next = curve(ratio + 0.01);
	vec2 y = normalize(next.xy - position.xy);
	vec2 x = vec2(y.y, - y.x);
	position.xy += size * x * aUV.y * vec2(resolutionHeight / resolutionWidth, 1);
	position.xy /= 1.0 + position.z;
	gl_Position = vec4(position, 1.0);
}

#pragma fragment 0

void mainF0() {
	color = colorize();
}

// PARTICLES

#pragma vertex 1

void mainV1() {
	vec3 position = curve(aPosition.y);
	vec2 aspectRatio = vec2(resolutionHeight / resolutionWidth, 1);
	float fall = smoothstep(fallAt, 1, fract(beat));
	float size = (0.03 + 0.015 * sin(aPosition.y * 8654.567)) * smoothstep(1, 0.8, fall) * smoothstep(0, 0.1, fall);
	size *= smoothstep(startAt - 0.5, startAt + 0.5, time);
	float a = sin(aPosition.y * 135734.2657) * PI;
	float r = sin(aPosition.y * 687451.5767) * 1.0 + 0.1;
	vec2 offset = vec2(cos(a), sin(a)) * aspectRatio * r;
	offset.y -= sin(fall * PI) * 0.5 - fall * 0.5;
	position.xy -= offset * fall;
	position.xy += size * aUV.xy * aspectRatio;
	position.xy /= 1 + position.z;
	gl_Position = vec4(position, 1);
	vUV = aUV;
}

#pragma fragment 1

void mainF1() {
	float d = length(vUV);
	if (d > 1.0)discard;
	color = colorize();
}

// POST FX

#pragma fragment 2

void mainF2() {
	float aspectRatio = resolutionWidth / resolutionHeight;
	
	vec2 uvc = gl_FragCoord.xy / vec2(resolutionWidth, resolutionHeight) - 0.5;
	uvc.x *= aspectRatio;
	vec2 uv = uvc / vec2(aspectRatio, 1) + 0.5;
	
	vec4 bgc = colorize();
	color = mix(1 - bgc, 0.5 * (1 - bgc), halftone(uvc * 40 * rot(beat / 20), floors((uv.x + uv.y) * 4) / 4 / 2));
	
	vec4 image = texture(firstPassTexture, uv);
	vec4 frame = texture(firstPassTexture, uv + vec2(0.01));
	float gray = (image.r + image.g + image.b) / 3.0;
	float gray2 = (frame.r + frame.g + frame.b) / 3.0;
	color = mix(color, 0.5 * image, step(0.001, gray));
	color = mix(color, frame, step(0.001, gray2));
}
