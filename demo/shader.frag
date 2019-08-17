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

vec3 palette(vec3 a, vec3 b, vec3 c, vec3 d, float t) {
	return a + b * cos(TAU * (c * t + d));
}

vec4 colorize() {
	return vec4(palette(vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 1.0, 2.0) / 3.0, floor(beat) * 0.1), 1.0);
}

mat2 rot(float a) {
	float c = cos(a), s = sin(a);
	return mat2(c, - s, s, c);
}

vec2 cs (float a) { return vec2(cos(a),sin(a)); }

vec2 evoke (float t) {
	return vec2((vec2(cs(3.142))*.114+vec2(cs(t-1.463))*.303+vec2(cs(t*2.-1.036))*.129+vec2(cs(t*3.-1.298))*.067+vec2(cs(t*4.-1.529))*.075+vec2(cs(t*5.-1.22))*.038+vec2(cs(t*6.-1.022))*.033+vec2(cs(t*7.-2.835))*.021+vec2(cs(t*8.-1.337))*.030+vec2(cs(t*9.-1.765))*.033+vec2(cs(t*10.-1.531))*.026+vec2(cs(t*11.-2.48))*.028+vec2(cs(t*12.-1.821))*.006+vec2(cs(t*13.-2.018))*.017+vec2(cs(t*14.-2.405))*.012).x,(vec2(cs(3.142))*.100+vec2(cs(t+.117))*.074+vec2(cs(t*2.+1.023))*.08+vec2(cs(t*3.+.659))*.06+vec2(cs(t*4.+.123))*.022+vec2(cs(t*5.+.804))*.049+vec2(cs(t*6.-.15))*.029+vec2(cs(t*7.+1.095))*.019+vec2(cs(t*8.+.555))*.022+vec2(cs(t*9.+.169))*.058+vec2(cs(t*10.-.712))*.014+vec2(cs(t*11.+.468))*.013+vec2(cs(t*12.-.193))*.036+vec2(cs(t*13.-1.541))*.005+vec2(cs(t*14.-1.486))*.008).x);
}

vec2 cookie (float t) {
	return vec2((vec2(1,0)*.079+vec2(cs(t-1.581))*.231+vec2(cs(t*2.-1.237))*.138+vec2(cs(t*3.-1.122))*.088+vec2(cs(t*4.-.759))*.062+vec2(cs(t*5.-.595))*.049+vec2(cs(t*6.+.560))*.026+vec2(cs(t*7.-2.733))*.026+vec2(cs(t*8.-1.255))*.022+vec2(cs(t*9.-1.442))*.017+vec2(cs(t*10.-2.092))*.029+vec2(cs(t*11.-2.179))*.010+vec2(cs(t*12.-1.91))*.02+vec2(cs(t*13.-2.932))*.006+vec2(cs(t*14.+3.008))*.009).x,(vec2(cs(3.142))*.049+vec2(cs(t+.353))*.058+vec2(cs(t*2.+.537))*.093+vec2(cs(t*3.+.438))*.033+vec2(cs(t*4.+1.024))*.074+vec2(cs(t*5.-.037))*.004+vec2(cs(t*6.+.386))*.032+vec2(cs(t*7.-1.484))*.018+vec2(cs(t*8.-3.057))*.018+vec2(cs(t*9.-.387))*.070+vec2(cs(t*10.-.394))*.028+vec2(cs(t*11.-.027))*.044+vec2(cs(t*12.-2.075))*.024+vec2(cs(t*13.-1.341))*.007+vec2(cs(t*14.-.674))*.011).x);
}

vec3 curve(float ratio) {
	float tt = beat;
	float ttt = 0.;
	if (time < textAt) {
		if (time > startAt) {
			ttt += floor(beat) * 5.246;
			tt = smoothstep(0, fallAt+.15, fract(beat));
			ratio *= (4 + tt * 9);
			ratio += ttt;
		} else {
			ratio += tt;
		}
	}

	float radius = .5 + (time>continueAt?.5:.15) * sin(ratio);

	vec3 position = vec3(radius, 0, 0);
	position.xz *= rot(ttt + ratio * 1.96*(time>moreAt?3:1));
	position.yz *= rot(ttt + ratio * 1.58*(time>moreAt?4:1));
	position.yx *= rot(ttt + ratio * 1.5*(time>moreAt?2:1));

	// if (time > continueAt) {
	// 	position.xz *= rot(tt * 1.5 + ttt);
	// 	position.yz *= rot(-tt * 2.0 + ttt);
	// }

	if (time > textAt) {
		float round = mod(floor(max(0., time-textAt)*.78), 2.);
		if (round < 0.5) position = vec3((cookie((1-ratio)*TAU)) * 2, 0);
		else position = vec3((evoke((1-ratio)*TAU)) * 2, 0);
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
	if (time > startAt) ratio *= smoothstep(0.0, fallAt, fract(beat));
	float size = 0.02;
	float fall = smoothstep(fallAt, 1.0, fract(beat));
	if (time > startAt) size *= smoothstep(0.1, 0.0, fall);
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
	float size = (.03 + .015 * sin(aPosition.y * 8654.567)) * smoothstep(1, .8, fall) * smoothstep(0, .1, fall);
	size *= smoothstep(startAt-.5, startAt+.5, time);
	float a = sin(aPosition.y * 135734.2657) * PI;
	float r = sin(aPosition.y * 687451.5767) * 1. + .1;
	vec2 offset = vec2(cos(a), sin(a)) * aspectRatio * r;
	offset.y -= sin(fall * PI) * .5 - fall * .5;
	position.xy -= offset * fall;
	position.xy += size * aUV.xy * aspectRatio;
	position.xy /= 1 + position.z;
	gl_Position = vec4(position, 1);
	vUV = aUV;
}

#pragma fragment 1

void mainF1() {
	float d = length(vUV);
	if (d > 1.0) discard;
	color = colorize();
}

// POST FX

#pragma fragment 2

void mainF2() {
	float aspectRatio = resolutionWidth / resolutionHeight;
	
	vec2 uvc = gl_FragCoord.xy / vec2(resolutionWidth, resolutionHeight) - .5;
	uvc.x *= aspectRatio;
	vec2 uv = uvc / vec2(aspectRatio, 1) + .5;
	
	vec4 bgc = colorize();
	color = mix(1-bgc, .5*(1-bgc), halftone(uvc * 40 * rot(beat / 20), floors((uv.x + uv.y) * 4) / 4 / 2));
	
	vec4 image = texture(firstPassTexture, uv);
	vec4 frame = texture(firstPassTexture, uv + vec2(0.01));
	float gray = (image.r + image.g + image.b) / 3.0;
	float gray2 = (frame.r + frame.g + frame.b) / 3.0;
	color = mix(color, 0.5 * image, step(0.001, gray));
	color = mix(color, frame, step(0.001, gray2));
}
