**A skeuomorphic, industrial-grade scientific toolkit built in React Native.**

*Your smartphone is a $1,000 brick of high-precision scientific sensors. Let's actually use them.*

---

Modern app design is flat, boring, and sterile. **Telemetry** (Phone Physics Lab) rejects that. Built for science curious tinkerers, makers, and data nerds, this suite taps directly into your device's internal hardware and renders the raw data through heavy, bolted-down, analog-inspired skeuomorphic interfaces.

It feels less like a mobile app and more like a piece of tactical diagnostic equipment you’d find in a Cold War submarine or an aviation testing facility.

---

### 🔬 THE ARSENAL (SENSOR SUITE)

| Module | Hardware | Analog Inspiration | Measurement |
| --- | --- | --- | --- |
| **🚀 KINEMATICS** | `Accelerometer` | Analog Aircraft G-Meter | G-Force, 3-Axis Kinematics |
| **🌪️ ATMOSPHERICS** | `Barometer` | Vintage Aviation Altimeter | Absolute Pressure, Elevation Shift |
| **🧲 ELECTROMAGNETICS** | `Magnetometer` | Industrial EMF Gaussmeter | Magnetic Flux, EMF Anomalies |
| **💡 OPTICS** | `Light Sensor` | Mid-Century Studio Photometer | Ambient Illuminance (Lux) |
| **🔊 ACOUSTICS** | `Microphone` | Studio Amplifier VU Meter | Sound Pressure Level (dB SPL) |

### 🛠️ HIGHLIGHTS & FEATURES

* **Skeuomorphic UI:** No flat design here. You get glowing CRT oscilloscopes, sweeping galvanometer needles, Kollsman altitude windows, and tactical LED warning lights.
* **Raw Physics Math:** Converts raw digital sensor data (`dBFS`, `illuminance`, `hPa`) into real-world human telemetry (`dB SPL`, logarithmic visual bloom, meter elevation shifts).
* **Live Waveform History:** Every single tool features a live, rolling SVG data graph tracking peak outputs over time.
* **Tactical Feedback:** Dynamic UI elements that react to extreme environments (e.g., the EMF scanner turns amber during a magnetic anomaly; the Decibel meter flashes red at hearing-damage thresholds).

---

### 🚀 DEPLOYMENT (QUICK START)

Since Apple restricts background sensor telemetry on bare iOS devices, the fastest way to run this lab is through the **Expo Go** tunnel.

**1. Clone the hardware schematic:**

```bash
git clone https://github.com/yourusername/telemetry-physics-lab.git
cd telemetry-physics-lab

```

**2. Calibrate the dependencies:**

```bash
npm install

```

**3. Engage the local server:**

```bash
npx expo start

```

*To share across the internet with a friend, boot the tunnel sequence:* `npx expo start --tunnel`

**4. Run on Device:**

* Download **Expo Go** on your iOS or Android device.
* Scan the terminal QR code to initialize the sensor suite.

---


### ⚙️ TECH SPECS

Built with absolute precision using:

* **React Native** & **Expo**
* **`expo-sensors`**: Accelerometer, Barometer, Magnetometer, LightSensor
* **`expo-audio`**: High-fidelity microphone metering
* **`react-native-svg`**: Real-time graphing and dynamic analog needles
* **`react-native-view-shot`** & **`expo-sharing`**: Social data export pipeline