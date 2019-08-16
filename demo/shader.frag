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
	position.x /= 800./600.;
	return position;
}

// RIBBONS
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
	color = vec4(1, 1, 1, fade);
}

// PARTICLES
#pragma vertex 1
void mainV1() {
	vec3 position = aPosition;
	float ratio = aUV.x * 0.5 + position.x * 2.0;
	float id = position.x;
	float angle = 2. * 3.1415 * position.x * .01;

	position.xyz = vec3(-10,-10,0);
	float size = .02;

	float shouldSplash = 1.0;
	if (shouldSplash > 0.5) {
		angle += sin(angle *4987.54687);
		float t = time+sin(angle*1357.57);
		float splashT = fract(t);
		float radius = .5 + .9 * sin(angle*6873.2467);
		size = .2+ .1 * sin(angle*927.6871);
		size *= smoothstep(.0, .1, splashT) * smoothstep(1.,.9,splashT);
		float a2 = sin(floor(t) * 1654.546 + angle * 554.4687) * 10.5465;
		vec2 offset = vec2(cos(a2),sin(a2))*.5;
		vec2 splash = splashT * vec2(cos(angle), sin(angle)) * radius + offset;
		splash.y += (sin(splashT*3.1415) - splashT)*.5;
		position.xy = splash;
		position.z = abs(sin(angle*8735.5798))*4.;
	}

	float shouldSpace = 0.0;
	if (shouldSpace > 0.5) {
		float spaceT = fract(time + sin(angle * 87359.5657) * 1354.5648);
		float a = angle * 154.4621;
		float r = angle * .4687;
		float y = sin(angle *4687.57687)*4.-.5;// - .5;
		position.xz = (vec2(cos(a),sin(a))) * r;
		position.y = y;
		// position.z = abs(position.z);
		position.z += (1.-spaceT)*10.*sign(position.z);
		size = 2.;
		size *= smoothstep(.0, .1, spaceT) * smoothstep(1.,.9,spaceT);

		float shouldRotate = 1.0;
		if (shouldRotate > 0.5) {
			position.xy *= rot(abs(position.z) * .1);
		}
	}

	float shouldTerrain = 0.0;
	if (shouldTerrain > 0.5) {
		size = .3+.2*sin(id*13574.5468);
		position.x = (mod(id,64.)/64.)*2.-1.;
		position.z = (floor(id/64.)/64.)*2.-1.;
		position.y = sin(length(position.xz)*8.-time*PI)*.2;
		// position.yz *= rot(-PI/2.);
		float a = sin(id*8673.468)*PI*2.;
		float r = .5*sin(id*15.578);
		position.xz += vec2(sin(a),cos(a))*r;
		float lod = length(position)*8.;
		// position = floor(position*lod)/lod;
		// po
		position.z += 1.;
		position.x += .1;
		// position.xz *= 2.;
	}

	position.xy += size * aUV.xy;// / (1.+abs(position.z));
	position.xy /= (1.+(position.z));
	position.x /= 800./600.;
	gl_Position = vec4(position.xy, 0.0, 1.0);
	vColor = vec3(aUV.xy * 0.5 + 0.5, 0);
	vUV = aUV;
}
#pragma fragment 1
void mainF1() {
	float d =  length(vUV);
	float alpha = smoothstep(1., .5, d);
	alpha = (1-d)*(.05/d);
	color = vec4(1,1,1,clamp(alpha,0.,1.));
}

// POST FX
#pragma fragment 2
void mainF2() {
	float aspectRatio = resolutionWidth / resolutionHeight;
	float beat = time * 2.08333;// BPS
	
	// A mod kaleidoscope.
	vec2 uvc = gl_FragCoord.xy / vec2(resolutionWidth, resolutionHeight) - 0.5;
	uvc.x *= aspectRatio;
	
	amodm(uvc, floor(fract(sin(floor(beat / 4.0)) * 1e3) * 5.0) + 1.0);
	vec2 uv = uvc / vec2(aspectRatio, 1) + 0.5;
	
	// Chromatic aberration.
	for(int i = 0; i < 3; ++ i)
	{
		color[i] = texture(firstPassTexture, (uv - 0.5) * (1.0 + exp(-fract(beat / 4.0)) * (0.01 + float(i) * 0.01)) + 0.5)[i];
	}
	color.a = 1.0;
}
