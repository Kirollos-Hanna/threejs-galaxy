uniform vec3 uColor;
uniform vec2 uResolution;

varying vec2 vUv;
varying float vElevation;

// Plot a line on Y using a value between 0.0-1.0
float plot(vec2 st) {    
    return smoothstep(0.02, 0.0, abs(st.y - st.x));
}

void main()
{
	vec2 st = gl_FragCoord.xy/uResolution;

    float y = st.x;

    vec3 color = vec3(y);

    // Plot a line
    float pct = plot(st);
    color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0);

	gl_FragColor = vec4(color,1.0);
    // gl_FragColor = vec4(uColor, 1.0);
    // gl_FragColor = vec4(vUv, 1.0, 1.0);
}