import { Onvif } from './onvif';
import { linerase } from './utils';
import { IPAddress, Name } from './interfaces/onvif';
import { ReferenceToken } from './interfaces/common';
import { AnyURI } from './interfaces/basics';
import { GetOSDs, GetOSDsResponse } from './interfaces/media.2';

export interface IntRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Rotate {
  /** Parameter to enable/disable Rotation feature */
  mode: 'OFF' | 'ON' | 'AUTO';
  /** Optional parameter to configure how much degree of clockwise rotation of image for On mode. Omitting this parameter for On mode means 180 degree rotation. */
  degree?: number;
  extension: any;
}

export interface LensOffset {
  /** Optional horizontal offset of the lens center in normalized coordinates */
  x: number;
  /** Optional vertical offset of the lens center in normalized coordinates */
  y: number;
}

export interface LensProjection {
  /** Angle of incidence */
  angle: number;
  /** Mapping radius as a consequence of the emergent angle */
  radius: number;
  /** Optional ray absorption at the given angle due to vignetting. A value of one means no absorption */
  transmittance?: number;
}

export interface LensDescription {
  /** Optional focal length of the optical system */
  focalLength: number;
  /** Offset of the lens center to the imager center in normalized coordinates */
  offset: LensOffset;
  /**
   * Radial description of the projection characteristics.
   * The resulting curve is defined by the B-Spline interpolation over the given elements.
   * The element for Radius zero shall not be provided. The projection points shall be ordered with ascending Radius.
   * Items outside the last projection Radius shall be assumed to be invisible (black)
   */
  projection: LensProjection;
  /** Compensation of the x coordinate needed for the ONVIF normalized coordinate system */
  XFactor: number;
}

export interface SceneOrientation {
  /** Parameter to assign the way the camera determines the scene orientation */
  mode: 'MANUAL' | 'AUTO';
  /**
   * Assigned or determined scene orientation based on the Mode.
   * When assigning the Mode to AUTO, this field is optional and will be ignored by the device.
   * When assigning the Mode to MANUAL, this field is required and the device will return an InvalidArgs fault if missing
   */
  orientation?: string;
}

export interface VideoSourceConfigurationExtension2 {
  /** Optional element describing the geometric lens distortion. Multiple instances for future variable lens support */
  lensDescription?: LensDescription;
  /** Optional element describing the scene orientation in the camera’s field of view */
  sceneOrientation: SceneOrientation;
}

export interface VideoSourceConfigurationExtension {
  /**
   * Optional element to configure rotation of captured image. What resolutions a device supports shall be unaffected by the Rotate parameters.
   * If a device is configured with Rotate=AUTO, the device shall take control over the Degree parameter and automatically update it so that a client can query current rotation.
   * The device shall automatically apply the same rotation to its pan/tilt control direction depending on the following condition:
   * if Reverse=AUTO in PTControlDirection or if the device doesn’t support Reverse in PTControlDirection
   */
  rotate: Rotate;
  extension?: VideoSourceConfigurationExtension2;
}

export interface VideoSourceConfiguration {
  /** Token that uniquely references this configuration. Length up to 64 characters */
  token: ReferenceToken;
  /** User readable name. Length up to 64 characters */
  name: Name;
  /**
   * Number of internal references currently using this configuration
   * This informational parameter is read-only. Deprecated for Media2 Service
   * */
  useCount: number;
  /** Readonly parameter signalling Source configuration's view mode, for devices supporting different view modes as defined in tt:viewModes */
  viewMode: string;
  /** Reference to the physical input */
  sourceToken: string;
  /** Rectangle specifying the Video capturing area. The capturing area shall not be larger than the whole Video source area */
  bounds: IntRectangle;
  extension?: VideoSourceConfigurationExtension;
}

export interface AudioSourceConfiguration {
  /** Token that uniquely references this configuration. Length up to 64 characters */
  token: ReferenceToken;
  /** User readable name. Length up to 64 characters */
  name: Name;
  /**
   * Number of internal references currently using this configuration
   * This informational parameter is read-only. Deprecated for Media2 Service
   */
  useCount: number;
  /** Token of the Audio Source the configuration applies to */
  sourceToken: string;
}

export interface VideoResolution {
  /** Number of the columns of the Video image */
  width: number;
  /** Number of the lines of the Video image */
  height: number;
}

export interface VideoRateControl {
  /** Maximum output framerate in fps. If an EncodingInterval is provided the resulting encoded framerate will be reduced by the given factor */
  frameRateLimit: number;
  /** Interval at which images are encoded and transmitted. (A value of 1 means that every frame is encoded, a value of 2 means that every 2nd frame is encoded ...) */
  encodingInterval: number;
  /** the maximum output bitrate in kbps */
  bitrateLimit: number;
}

export interface Mpeg4Configuration {
  /**
   * Determines the interval in which the I-Frames will be coded. An entry of 1 indicates I-Frames are continuously generated.
   * An entry of 2 indicates that every 2nd image is an I-Frame, and 3 only every 3rd frame, etc.
   * The frames in between are coded as P or B Frames
   */
  govLength: number;
  /** The Mpeg4 profile, either simple profile (SP) or advanced simple profile (ASP) */
  mpeg4Profile: 'SP' | 'ASP';
}

export interface H264Configuration {
  /**
   * Group of Video frames length. Determines typically the interval in which the I-Frames will be coded.
   * An entry of 1 indicates I-Frames are continuously generated.
   * An entry of 2 indicates that every 2nd image is an I-Frame, and 3 only every 3rd frame, etc.
   * The frames in between are coded as P or B Frames
   */
  govLength: number;
  /** The H.264 profile, either baseline, main, extended or high */
  H264Profile: 'Baseline' | 'Main' | 'Extended' | 'High';
}

export interface MulticastConfiguration {
  /** The multicast address (if this address is set to 0 no multicast streaming is enaled) */
  address: IPAddress;
  /**
   * The RTP mutlicast destination port. A device may support RTCP.
   * In this case the port value shall be even to allow the corresponding RTCP stream to be mapped to the next higher (odd)
   * destination port number as defined in the RTSP specification
   */
  port: number;
  /**
   * In case of IPv6 the TTL value is assumed as the hop limit.
   * Note that for IPV6 and administratively scoped IPv4 multicast the primary use for hop limit / TTL is to prevent packets
   * from (endlessly) circulating and not limiting scope. In these cases the address contains the scope
   */
  TTL: number;
  /**
   * Read only property signalling that streaming is persistant.
   * Use the methods StartMulticastStreaming and StopMulticastStreaming to switch its state.
   */
  autoStart: boolean;
}

export type Duration = string;

export interface VideoEncoderConfiguration {
  /** Token that uniquely references this configuration. Length up to 64 characters */
  token: ReferenceToken;
  /** User readable name. Length up to 64 characters */
  name: Name;
  /**
   * Number of internal references currently using this configuration.
   * This informational parameter is read-only. Deprecated for Media2 Service.
   */
  useCount: number;
  /**
   * A value of true indicates that frame rate is a fixed value rather than an upper limit,
   * and that the video encoder shall prioritize frame rate over all other adaptable configuration values such as bitrate.
   * Default is false.
   */
  guaranteedFrameRate: boolean;
  /** Used video codec, either Jpeg, H.264 or Mpeg4 */
  encoding: 'JPEG' | 'MPEG4' | 'H264';
  /** Configured video resolution */
  resolution: VideoResolution;
  /**
   * Relative value for the video quantizers and the quality of the video.
   * A high value within supported quality range means higher quality
   */
  quality: number;
  /** Optional element to configure rate control related parameters. */
  rateControl?: VideoRateControl;
  /** Optional element to configure Mpeg4 related parameters */
  MPEG4?: Mpeg4Configuration;
  /** Optional element to configure H.264 related parameters. */
  H264?: H264Configuration;
  /** Defines the multicast settings that could be used for video streaming */
  multicast: MulticastConfiguration;
  /** The rtsp session timeout for the related video stream */
  sessionTimeout: Duration;
}

export interface AudioEncoderConfiguration {
  /** Token that uniquely references this configuration. Length up to 64 characters */
  token: ReferenceToken;
  /** User readable name. Length up to 64 characters */
  name: Name;
  /**
   * Number of internal references currently using this configuration.
   * This informational parameter is read-only. Deprecated for Media2 Service.
   */
  useCount: number;
  /** Audio codec used for encoding the audio input (either G.711, G.726 or AAC) */
  encoding: 'G711' | 'G726' | 'AAC';
  /** The output bitrate in kbps */
  bitrate: number;
  /** The output sample rate in kHz */
  sampleRate: number;
  /** Defines the multicast settings that could be used for video streaming */
  multicast: MulticastConfiguration;
  /** The rtsp session timeout for the related audio stream */
  sessionTimeout: Duration;
}

export interface ItemList {
  /** Value name pair as defined by the corresponding description */
  simpleItem?: {
    /** Item name */
    name: string;
    /** Item value. The type is defined in the corresponding description */
    value: any;
  };
  /** Complex value structure */
  elementItem?: any;
  extension: any;
}

export interface Config {
  /** Name of the configuration */
  name: string;
  /**
   * The Type attribute specifies the type of rule and shall be equal to value of one of Name attributes of ConfigDescription elements
   * returned by GetSupportedRules and GetSupportedAnalyticsModules command.
   */
  type: string;
  /** List of configuration parameters as defined in the corresponding description */
  parameters: ItemList[];
}

export interface AnalyticsEngineConfiguration {
  analyticsModule?: Config;
  extension?: any;
}

export interface RuleEngineConfiguration {
  rule?: Config;
  extension?: any;
}

export interface VideoAnalyticsConfiguration {
  /** Token that uniquely references this configuration. Length up to 64 characters */
  token: ReferenceToken;
  /** User readable name. Length up to 64 characters */
  name: Name;
  /**
   * Number of internal references currently using this configuration.
   * This informational parameter is read-only. Deprecated for Media2 Service.
   */
  useCount: number;
  analyticsEngineConfiguration: AnalyticsEngineConfiguration;
  ruleEngineConfiguration: RuleEngineConfiguration;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector1D {
  x: number;
}

export interface PTZSpeed {
  /**
   * Pan and tilt speed. The x component corresponds to pan and the y component to tilt.
   * If omitted in a request, the current (if any) PanTilt movement should not be affected
   */
  panTilt?: Vector2D;
  /** A zoom speed. If omitted in a request, the current (if any) Zoom movement should not be affected */
  zoom?: Vector1D;
}

export interface Range {
  min: number;
  max: number;
}

export interface Space2DDescription {
  /** A URI of coordinate systems */
  URI: AnyURI;
  /** A range of x-axis */
  XRange: Range;
  /** A range of y-axis */
  YRange: Range;
}

export interface PanTiltLimits {
  /** A range of pan tilt limits */
  range: Space2DDescription;
}

export interface Space1DDescription {
  /** A URI of coordinate systems */
  URI: string;
  /** A range of x-axis */
  XRange: Range;
}

export interface ZoomLimits {
  range: Space1DDescription;
}

export interface PTControlDirection {
  /** Optional element to configure related parameters for E-Flip */
  EFlip?: {
    /** Parameter to enable/disable E-Flip feature */
    mode: 'OFF' | 'ON' | 'Extended';
  };
  /** Optional element to configure related parameters for reversing of PT Control Direction */
  reverse: {
    /** Parameter to enable/disable Reverse feature */
    mode: 'OFF' | 'ON' | 'AUTO' | 'Extended';
  };
  extension: any;
}

export interface PTZConfigurationExtension {
  /** Optional element to configure PT Control Direction related features */
  PTControlDirection: PTControlDirection;
  extension: any;
}

export interface PTZConfiguration {
  /** Token that uniquely references this configuration. Length up to 64 characters */
  token: ReferenceToken;
  /** User readable name. Length up to 64 characters */
  name: Name;
  /**
   * Number of internal references currently using this configuration.
   * This informational parameter is read-only. Deprecated for Media2 Service.
   */
  useCount: number;
  /** The optional acceleration ramp used by the device when moving */
  moveRamp?: number;
  /** The optional acceleration ramp used by the device when recalling presets */
  presetRamp?: number;
  /** The optional acceleration ramp used by the device when executing PresetTours */
  presetTourRamp?: number;
  /** A mandatory reference to the PTZ Node that the PTZ Configuration belongs to */
  nodeToken: string;
  /** If the PTZ Node supports absolute Pan/Tilt movements, it shall specify one Absolute Pan/Tilt Position Space as default */
  defaultAbsolutePantTiltPositionSpace?: string;
  /** If the PTZ Node supports absolute zoom movements, it shall specify one Absolute Zoom Position Space as default */
  defaultAbsoluteZoomPositionSpace?: string;
  /** If the PTZ Node supports relative Pan/Tilt movements, it shall specify one RelativePan/Tilt Translation Space as default */
  defaultRelativePanTiltTranslationSpace?: string;
  /** If the PTZ Node supports relative zoom movements, it shall specify one Relative Zoom Translation Space as default */
  defaultRelativeZoomTranslationSpace?: string;
  /** If the PTZ Node supports continuous Pan/Tilt movements, it shall specify one Continuous Pan/Tilt Velocity Space as default */
  defaultContinuousPanTiltVelocitySpace?: string;
  /** If the PTZ Node supports continuous zoom movements, it shall specify one Continuous Zoom Velocity Space as default */
  defaultContinuousZoomVelocitySpace?: string;
  /** If the PTZ Node supports absolute or relative PTZ movements, it shall specify corresponding default Pan/Tilt and Zoom speeds */
  defaultPTZSpeed?: PTZSpeed;
  /** If the PTZ Node supports continuous movements, it shall specify a default timeout, after which the movement stops */
  defaultPTZTimeout?: Duration;
  /**
   * The Pan/Tilt limits element should be present for a PTZ Node that supports an absolute Pan/Tilt.
   * If the element is present it signals the support for configurable Pan/Tilt limits.
   * If limits are enabled, the Pan/Tilt movements shall always stay within the specified range.
   * The Pan/Tilt limits are disabled by setting the limits to –INF or +INF
   */
  panTiltLimits?: PanTiltLimits;
  /**
   * The Zoom limits element should be present for a PTZ Node that supports absolute zoom.
   * If the element is present it signals the supports for configurable Zoom limits.
   * If limits are enabled the zoom movements shall always stay within the specified range.
   * The Zoom limits are disabled by settings the limits to -INF and +INF
   */
  zoomLimits?: ZoomLimits;
  extension?: PTZConfigurationExtension;
}

export interface PTZFilter {
  /** `true` if the metadata stream shall contain the PTZ status (IDLE, MOVING or UNKNOWN) */
  status: boolean;
  /** `true` if the metadata stream shall contain the PTZ position */
  position: boolean;
}

export interface EventSubscription {
  filter?: string;
  subscriptionPolicy?: any;
}

export interface MetadataConfiguration {
  /** Token that uniquely references this configuration. Length up to 64 characters */
  token: ReferenceToken;
  /** User readable name. Length up to 64 characters */
  name: Name;
  /**
   * Number of internal references currently using this configuration.
   * This informational parameter is read-only. Deprecated for Media2 Service.
   */
  useCount: number;
  /** Optional parameter to configure compression type of Metadata payload. Use values from enumeration MetadataCompressionType */
  compressionType: string;
  /** Optional parameter to configure if the metadata stream shall contain the Geo Location coordinates of each target */
  geoLocation: boolean;
  /** Optional parameter to configure if the generated metadata stream should contain shape information as polygon */
  shapePolygon: boolean;
  /** Optional element to configure which PTZ related data is to include in the metadata stream */
  PTZStatus?: PTZFilter;
  /**
   * Optional element to configure the streaming of events.
   * A client might be interested in receiving all, none or some of the events produced by the device:
   * - To get all events: Include the Events element but do not include a filter
   * - To get no events: Do not include the Events element
   * - To get only some events: Include the Events element and include a filter in the element
   */
  events: EventSubscription;
  /** Defines whether the streamed metadata will include metadata from the analytics engines (video, cell motion, audio etc.) */
  analytics?: boolean;
  /** Defines the multicast settings that could be used for video streaming */
  multicast: MulticastConfiguration;
  /** The rtsp session timeout for the related audio stream (when using Media2 Service, this value is deprecated and ignored) */
  sessionTimeout: Duration;
  /**
   * Indication which AnalyticsModules shall output metadata.
   * Note that the streaming behavior is undefined if the list includes items that are not part of the associated AnalyticsConfiguration
   */
  analyticsEngineConfiguration?: AnalyticsEngineConfiguration;
  extension?: any;
}

export interface AudioOutputConfiguration {
  /** Token that uniquely references this configuration. Length up to 64 characters */
  token: ReferenceToken;
  /** User readable name. Length up to 64 characters */
  name: Name;
  /**
   * Number of internal references currently using this configuration.
   * This informational parameter is read-only. Deprecated for Media2 Service.
   */
  useCount: number;
  /** Token of the phsycial Audio output */
  outputToken: ReferenceToken;
  /**
   * An audio channel MAY support different types of audio transmission.
   * While for full duplex operation no special handling is required, in half duplex operation the transmission direction needs to be switched.
   * The optional SendPrimacy parameter inside the AudioOutputConfiguration indicates which direction is currently active.
   * An NVC can switch between different modes by setting the AudioOutputConfiguration.
   * The following modes for the Send-Primacy are defined:
   * - www.onvif.org/ver20/HalfDuplex/Server The server is allowed to send audio data to the client.
   *   The client shall not send audio data via the backchannel to the NVT in this mode.
   * - www.onvif.org/ver20/HalfDuplex/Client The client is allowed to send audio data via the backchannel to the server.
   *   The NVT shall not send audio data to the client in this mode.
   * - www.onvif.org/ver20/HalfDuplex/Auto It is up to the device how to deal with sending and receiving audio data.
   * Acoustic echo cancellation is out of ONVIF scope.
   */
  sendPrimacy?: AnyURI;
  /** Volume setting of the output. The applicable range is defined via the option AudioOutputOptions.OutputLevelRang */
  outputLevel: number;
}

export interface AudioDecoderConfiguration {
  /** Token that uniquely references this configuration. Length up to 64 characters */
  token: ReferenceToken;
  /** User readable name. Length up to 64 characters */
  name: Name;
  /**
   * Number of internal references currently using this configuration.
   * This informational parameter is read-only. Deprecated for Media2 Service.
   */
  useCount: number;
}

export interface ProfileExtension {
  /** Optional configuration of the Audio output */
  audioOutputConfiguration: AudioOutputConfiguration;
  /** Optional configuration of the Audio decoder */
  audioDecoderConfiguration: AudioDecoderConfiguration;
  extension?: any;
}

export interface Profile {
  /** Unique identifier of the profile */
  token: ReferenceToken;
  /** A value of true signals that the profile cannot be deleted. Default is false */
  fixed: boolean;
  /** User readable name of the profile */
  name: string;
  /** Optional configuration of the Video input */
  videoSourceConfiguration?: VideoSourceConfiguration;
  /** Optional configuration of the Audio input */
  audioSourceConfiguration?: AudioSourceConfiguration;
  /** Optional configuration of the Video encoder */
  videoEncoderConfiguration?: VideoEncoderConfiguration;
  /** Optional configuration of the Audio encoder */
  audioEncoderConfiguration?: AudioEncoderConfiguration;
  /** Optional configuration of the video analytics module and rule engine */
  videoAnalyticsConfiguration?: VideoAnalyticsConfiguration;
  /** Optional configuration of the pan tilt zoom unit */
  PTZConfiguration?: PTZConfiguration;
  /** Optional configuration of the metadata stream */
  metadataConfiguration?: MetadataConfiguration;
  /** Extensions defined in ONVIF 2.0 */
  extension?: ProfileExtension;
}

export interface VideoRateControl2 {
  /** Enforce constant bitrate */
  constantBitRate: boolean;
  /** Desired frame rate in fps. The actual rate may be lower due to e.g. performance limitations */
  frameRateLimit: number;
  /** the maximum output bitrate in kbps */
  bitrateLimit: number;
}

export interface VideoEncoder2Configuration {
  /** Token that uniquely references this configuration. Length up to 64 characters */
  token: ReferenceToken;
  /** User readable name. Length up to 64 characters */
  name: Name;
  /**
   * Number of internal references currently using this configuration.
   * This informational parameter is read-only. Deprecated for Media2 Service.
   */
  useCount?: number;
  /**
   * Group of Video frames length. Determines typically the interval in which the I-Frames will be coded.
   * An entry of 1 indicates I-Frames are continuously generated. An entry of 2 indicates that every 2nd image is an I-Frame,
   * and 3 only every 3rd frame, etc. The frames in between are coded as P or B Frames
   */
  govLength: number;
  /** The encoder profile as defined in tt:VideoEncodingProfiles */
  profile: string;
  /**
   * A value of true indicates that frame rate is a fixed value rather than an upper limit,
   * and that the video encoder shall prioritize frame rate over all other adaptable configuration values such as bitrate.
   * Default is false.
   */
  guaranteedFrameRate: boolean;
  /**
   * Video Media Subtype for the video format. For definitions see tt:VideoEncodingMimeNames and IANA Media Types
   * https://www.iana.org/assignments/media-types/media-types.xhtml#video
   */
  encoding: string;
  /** Configured video resolution */
  resolution: VideoResolution;
  /** Optional element to configure rate control related parameters. */
  rateControl?: VideoRateControl2;
  /** Defines the multicast settings that could be used for video streaming */
  mutlicast?: MulticastConfiguration;
  /**
   * Relative value for the video quantizers and the quality of the video.
   * A high value within supported quality range means higher quality
   */
  quality: number;
}

export interface AudioEncoder2Configuration {
  /** Token that uniquely references this configuration. Length up to 64 characters */
  token: ReferenceToken;
  /** User readable name. Length up to 64 characters */
  name: Name;
  /**
   * Number of internal references currently using this configuration.
   * This informational parameter is read-only. Deprecated for Media2 Service.
   */
  useCount: number;
  /**
   * Audio Media Subtype for the audio format. For definitions see tt:AudioEncodingMimeNames and IANA Media Types
   * https://www.iana.org/assignments/media-types/media-types.xhtml#audio
   */
  encoding: string;
  /** Optional multicast configuration of the audio stream */
  multicast?: MulticastConfiguration;
  /** The output bitrate in kbps */
  bitrate: number;
  /** The output sample rate in kHz */
  sampleRate: number;
}

export interface ConfigurationSet {
  /** Optional configuration of the Video input */
  videoSource?: VideoSourceConfiguration;
  /** Optional configuration of the Audio input */
  audioSource?: AudioSourceConfiguration;
  /** Optional configuration of the Video encoder */
  videoEncoder?: VideoEncoder2Configuration;
  /** Optional configuration of the Audio encoder */
  audioEncoder?: AudioEncoder2Configuration;
  /** Optional configuration of the analytics module and rule engine */
  analytics?: VideoAnalyticsConfiguration;
  /** Optional configuration of the pan tilt zoom unit */
  PTZ?: PTZConfiguration;
  /** Optional configuration of the metadata stream */
  metadata?: MetadataConfiguration;
  /** Optional configuration of the Audio output */
  audioOutput?: AudioOutputConfiguration;
  /** Optional configuration of the Audio decoder */
  audioDecoder?: AudioDecoderConfiguration;
  /** Optional configuration of the Receiver */
  receiver?: any;
}

export interface MediaProfile {
  /** Unique identifier of the profile */
  token: ReferenceToken;
  /** A value of true signals that the profile cannot be deleted. Default is false */
  fixed: boolean;
  /** User readable name of the profile */
  name: Name;
  /** The configurations assigned to the profile */
  configurations: ConfigurationSet;
}

export interface BacklightCompensation {
  /**
   * Backlight compensation mode (on/off).
   * - OFF: Backlight compensation is disabled
   * - ON: Backlight compensation is enabled
   */
  mode: 'ON' | 'OFF';
  /** Optional level parameter (unit unspecified) */
  level: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Exposure {
  /**
   * Exposure Mode
   * - Auto – Enabled the exposure algorithm on the NVT
   * - Manual – Disabled exposure algorithm on the NVT
   */
  mode: 'AUTO' | 'MANUAL';
  /** The exposure priority mode (low noise/framerate) */
  priority: 'LowNoise' | 'FrameRate';
  /** Rectangular exposure mask */
  window: Rectangle;
  /** Minimum value of exposure time range allowed to be used by the algorithm */
  minExposureTime: number;
  /** Maximum value of exposure time range allowed to be used by the algorithm */
  maxExposureTime: number;
  /** Minimum value of the sensor gain range that is allowed to be used by the algorithm */
  minGain: number;
  /** Maximum value of the sensor gain range that is allowed to be used by the algorithm */
  maxGain: number;
  /** Minimum value of the iris range allowed to be used by the algorithm */
  minIris: number;
  /** Maximum value of the iris range allowed to be used by the algorithm */
  maxIris: number;
  /** The fixed exposure time used by the image sensor (μs) */
  exposureTime: number;
  /** The fixed gain used by the image sensor (dB) */
  gain: number;
  /** The fixed attenuation of input light affected by the iris (dB). 0dB maps to a fully opened iris */
  iris: number;
}

export interface FocusConfiguration {
  autoFocusMode: 'AUTO' | 'MANUAL';
  defaultSpeed: number;
  /** Parameter to set autofocus near limit (unit: meter) */
  nearLimit: number;
  /** Parameter to set autofocus far limit (unit: meter). If set to 0.0, infinity will be used */
  farLimit: number;
}

export interface WideDynamicRange {
  /** White dynamic range (on/off) */
  mode: 'OFF' | 'ON';
  /** Optional level parameter (unitless) */
  level: number;
}

export interface WhiteBalance {
  /** Auto whitebalancing mode (auto/manual) */
  mode: 'AUTO' | 'MANUAL';
  /** Rgain (unitless) */
  crGain: number;
  /** Bgain (unitless) */
  cbGain: number;
}

export interface ImagingSettings {
  /** Enabled/disabled BLC mode (on/off) */
  backlightCompensation?: BacklightCompensation;
  /** Image brightness (unit unspecified) */
  brightness?: number;
  /** Color saturation of the image (unit unspecified) */
  colorSaturation?: number;
  /** Contrast of the image (unit unspecified) */
  contrast?: number;
  /** Exposure mode of the device */
  exposure?: Exposure;
  /** Focus configuration */
  focus?: FocusConfiguration;
  /** Infrared Cutoff Filter settings */
  irCutFilter?: 'ON' | 'OFF' | 'AUTO';
  /** Sharpness of the Video image */
  sharpness?: number;
  /** WDR settings */
  wideDynamicRange?: WideDynamicRange;
  /** White balance settings */
  whiteBalance?: WhiteBalance;
  extension?: any;
}

export interface BacklightCompensation20 {
  /**
   * Backlight compensation mode (on/off)
   * - OFF: Backlight compensation is disabled
   * - ON: Backlight compensation is enabled
   */
  mode: 'OFF' | 'ON';
  /** Optional level parameter (unit unspecified) */
  level?: number;
}

export interface Exposure20 {
  /**
   * Exposure Mode
   * - Auto – Enabled the exposure algorithm on the device
   * - Manual – Disabled exposure algorithm on the device
   */
  mode: 'AUTO' | 'MANUAL';
  /** The exposure priority mode (low noise/framerate) */
  priority?: 'LowNoise' | 'FrameRate';
  /** Rectangular exposure mask */
  window?: Rectangle;
  /** Minimum value of exposure time range allowed to be used by the algorithm */
  minExposureTime?: number;
  /** Maximum value of exposure time range allowed to be used by the algorithm */
  maxExposureTime?: number;
  /** Minimum value of the sensor gain range that is allowed to be used by the algorithm */
  minGain?: number;
  /** Maximum value of the sensor gain range that is allowed to be used by the algorithm */
  maxGain?: number;
  /** Minimum value of the iris range allowed to be used by the algorithm. 0dB maps to a fully opened iris and positive values map to higher attenuation */
  minIris?: number;
  /** Maximum value of the iris range allowed to be used by the algorithm. 0dB maps to a fully opened iris and positive values map to higher attenuation */
  maxIris?: number;
  /** The fixed exposure time used by the image sensor (μs) */
  exposureTime?: number;
  /** The fixed gain used by the image sensor (dB) */
  gain?: number;
  /** The fixed attenuation of input light affected by the iris (dB). 0dB maps to a fully opened iris and positive values map to higher attenuation */
  iris?: number;
}

export interface FocusConfiguration20 {
  /** Zero or more modes as defined in enumeration tt:AFModes */
  AFMode: string[];
  /**
   * Mode of auto focus
   * - AUTO - The device automatically adjusts focus
   * - MANUAL - The device does not automatically adjust focus
   * Note: for devices supporting both manual and auto operation at the same time manual operation may be supported
   * even if the Mode parameter is set to Auto.
   */
  autoFocusMode: 'AUTO' | 'MANUAL';
  defaultSpeed?: number;
  /** Parameter to set autofocus near limit (unit: meter) */
  nearLimit?: number;
  /** Parameter to set autofocus far limit (unit: meter) */
  farLimit?: number;
  extension?: any;
}

export interface WideDynamicRange20 {
  /** Wide dynamic range mode (on/off) */
  mode?: 'OFF' | 'ON';
  /** Optional level parameter (unit unspecified) */
  level?: number;
}

export interface WhiteBalance20 extends WhiteBalance {
  extension: any;
}

export interface ImageStabilization {
  /** Parameter to enable/disable Image Stabilization feature */
  mode: 'OFF' | 'ON' | 'AUTO' | 'Extended';
  /** Optional level parameter (unit unspecified) */
  level?: number;
  extension?: any;
}

export interface IrCutFilterAutoAdjustment {
  /**
   * Specifies which boundaries to automatically toggle Ir cut filter following parameters are applied to.
   * Its options shall be chosen from tt:IrCutFilterAutoBoundaryType
   */
  boundaryType: string;
  /**
   * Adjusts boundary exposure level for toggling Ir cut filter to on/off specified with unitless normalized value
   * from +1.0 to -1.0. Zero is default and -1.0 is the darkest adjustment (Unitless).
   */
  boundaryOffset?: number;
  /** Delay time of toggling Ir cut filter to on/off after crossing of the boundary exposure levels */
  responseTime?: Duration;
  extension?: any;
}

export interface ToneCompensation {
  /** Parameter to enable/disable or automatic ToneCompensation feature. Its options shall be chosen from tt:ToneCompensationMode Type */
  mode: string;
  /** Optional level parameter specified with unitless normalized value from 0.0 to +1.0 */
  level?: number;
  extension?: any;
}

export interface Defogging {
  /** Parameter to enable/disable or automatic Defogging feature. Its options shall be chosen from tt:DefoggingMode Type */
  mode: string;
  /** Optional level parameter specified with unitless normalized value from 0.0 to +1.0 */
  level?: number;
  extension?: any;
}

export interface NoiseReduction {
  /**
   * Level parameter specified with unitless normalized value from 0.0 to +1.0.
   * Level=0 means no noise reduction or minimal noise reduction
   */
  level: number;
}

export interface ImagingSettingsExtension203 {
  /** Optional element to configure Image Contrast Compensation */
  toneCompensation?: ToneCompensation;
  /** Optional element to configure Image Defogging */
  defogging?: Defogging;
  /** Optional element to configure Image Noise Reduction */
  noiseReduction?: NoiseReduction;
  extension?: any;
}

export interface ImagingSettingsExtension202 {
  /** An optional parameter applied to only auto mode to adjust timing of toggling Ir cut filter */
  irCutFilterAutoAdjustment?: IrCutFilterAutoAdjustment;
  extension?: ImagingSettingsExtension203;
}

export interface ImagingSettingsExtension20 {
  /** Optional element to configure Image Stabilization feature */
  imageStabilization?: ImageStabilization;
  extension?: ImagingSettingsExtension202;
}

export interface ImagingSettings20 {
  /** Enabled/disabled BLC mode (on/off) */
  backlightCompensation?: BacklightCompensation20;
  /** Image brightness (unit unspecified) */
  brightness?: number;
  /** Color saturation of the image (unit unspecified) */
  colorSaturation?: number;
  /** Contrast of the image (unit unspecified) */
  contrast?: number;
  /** Exposure mode of the device */
  exposure?: Exposure20;
  /** Focus configuration */
  focus?: FocusConfiguration20;
  /** Infrared Cutoff Filter settings */
  irCutFilter?: 'ON' | 'OFF' | 'AUTO';
  /** Sharpness of the Video image */
  sharpness?: number;
  /** WDR settings */
  wideDynamicRange?: WideDynamicRange20;
  /** White balance settings */
  whiteBalance?: WhiteBalance20;
  extension?: ImagingSettingsExtension20;
}

export interface VideoSourceExtension {
  /** Optional configuration of the image sensor. To be used if imaging service 2.00 is supported */
  imaging?: ImagingSettings20;
  extension?: any;
}

export interface VideoSource {
  /** Unique identifier referencing the physical entity */
  token: ReferenceToken;
  /** Frame rate in frames per second */
  framerate: number;
  /** Horizontal and vertical resolution */
  resolution: VideoResolution;
  /** Optional configuration of the image sensor */
  imaging?: ImagingSettings;
  extension?: VideoSourceExtension;
}

export interface GetStreamUriOptions {
  profileToken?: ReferenceToken;
  stream?: 'RTP-Unicast' | 'RTP-Multicast';
  protocol?:
    'RtspUnicast' | 'RtspMulticast' | 'RTSP' | 'RtspOverHttp' | // for Media2
    'UDP'| 'TCP' | 'HTTP'; // for Media1
}

export interface GetSnapshotUriOptions {
  profileToken?: ReferenceToken;
}

export class Media {
  private onvif: Onvif;
  public profiles: Profile[] = [];
  public videoSources: VideoSource[] = [];

  constructor(onvif: Onvif) {
    this.onvif = onvif;
  }

  /**
   * Receive profiles
   */
  async getProfiles(): Promise<(Profile | MediaProfile)[]> {
    if (this.onvif.device.media2Support) {
      // Profile T request using Media2
      // The reply is in a different format to the old API so we convert the data from the new API to the old structure
      // for backwards compatibility with existing users of this library
      const [data] = await this.onvif.request({
        service : 'media2',
        body    : '<GetProfiles xmlns="http://www.onvif.org/ver20/media/wsdl"><Type>All</Type></GetProfiles>',
      });

      // Slight difference in Media1 and Media2 reply XML
      // Generate a reply that looks like a Media1 reply for existing library users
      this.profiles = data[0].getProfilesResponse[0].profiles.map((profile: Record<string, unknown>) => {
        const tmp = linerase(profile) as MediaProfile;
        const newProfile: Profile = {
          token : tmp.token,
          name  : tmp.name,
          fixed : tmp.fixed || false,
        };
        // Media2 Spec says there will be these some or all of these configuration entities
        // Video source configuration
        // Audio source configuration
        // Video encoder configuration
        // Audio encoder configuration
        // PTZ configuration
        // Video analytics configuration
        // Metadata configuration
        // Audio output configuration
        // Audio decoder configuration
        if (tmp.configurations.videoSource) { newProfile.videoSourceConfiguration = tmp.configurations.videoSource; }
        if (tmp.configurations.audioSource) { newProfile.audioSourceConfiguration = tmp.configurations.audioSource; }
        if (tmp.configurations.videoEncoder) {
          newProfile.videoEncoderConfiguration = tmp.configurations.videoEncoder as unknown as VideoEncoderConfiguration;
        }
        if (tmp.configurations.audioEncoder) {
          newProfile.audioEncoderConfiguration = tmp.configurations.audioEncoder as AudioEncoderConfiguration;
        }
        if (tmp.configurations.PTZ) { newProfile.PTZConfiguration = tmp.configurations.PTZ; }
        if (tmp.configurations.analytics) { newProfile.videoAnalyticsConfiguration = tmp.configurations.analytics; }
        if (tmp.configurations.metadata) { newProfile.metadataConfiguration = tmp.configurations.metadata; }
        if (tmp.configurations.audioOutput || tmp.configurations.audioDecoder) {
          newProfile.extension = {
            audioOutputConfiguration  : tmp.configurations.audioOutput!,
            audioDecoderConfiguration : tmp.configurations.audioDecoder!,
          };
        }
        // TODO - Add Audio
        return newProfile;
      });
      return this.profiles;
    }
    // Original ONVIF Media support (used in Profile S)
    const [data] = await this.onvif.request({
      service : 'media',
      body    : '<GetProfiles xmlns="http://www.onvif.org/ver10/media/wsdl"/>',
    });
    this.profiles = data[0].getProfilesResponse[0].profiles.map(linerase);
    return this.profiles;
  }

  async getVideoSources() {
    const [data] = await this.onvif.request({
      service : 'media',
      body    : '<GetVideoSources xmlns="http://www.onvif.org/ver10/media/wsdl"/>',
    });
    const a = linerase(data);
    this.videoSources = linerase(data).getVideoSourcesResponse.videoSources;
    // videoSources is an array of video sources, but linerase remove the array if there is only one element inside,
    // so we convert it back to an array
    if (!Array.isArray(this.videoSources)) { this.videoSources = [this.videoSources]; }
    return this.videoSources;
  }

  /**
   * This method requests a URI that can be used to initiate a live media stream using RTSP as the control protocol.
   * The returned URI shall remain valid indefinitely even if the profile is changed.
   * Method uses Media2 if device supports it.
   *
   * For Media2 you need to provide only `protocol` parameter ('RTPS' by default). Here is supported values from the
   * ONVIF documentation:
   * Defined stream types are
   * - RtspUnicast RTSP streaming RTP as UDP Unicast.
   * - RtspMulticast RTSP streaming RTP as UDP Multicast.
   * - RTSP RTSP streaming RTP over TCP.
   * - RtspOverHttp Tunneling both the RTSP control channel and the RTP stream over HTTP or HTTPS.
   *
   * For Media1 you need to set both parameters: protocl and stream (RTP-Unicast by default) If Media2 supported
   * by device, this parameters will be converted to Media2 call. This is excerpt from ONVIF documentation:
   * The correct syntax for the StreamSetup element for these media stream setups defined in 5.1.1 of the streaming specification are as follows:
   * - RTP unicast over UDP: StreamType = "RTP_unicast", TransportProtocol = "UDP"
   * - RTP over RTSP over HTTP over TCP: StreamType = "RTP_unicast", TransportProtocol = "HTTP"
   * - RTP over RTSP over TCP: StreamType = "RTP_unicast", TransportProtocol = "RTSP"
   */
  async getStreamUri(options: GetStreamUriOptions = {}):
    Promise<{uri: AnyURI; invalidAfterConnect?: boolean; invalidAfterReboot?: boolean; timeout?: Duration}> {
    const {
      profileToken,
      stream = 'RTP-Unicast',
    } = options;
    let { protocol = 'RTSP' } = options;
    if (this.onvif.device.media2Support) {
      // Permitted values for options.protocol are :-
      //   RtspUnicast - RTSP streaming RTP via UDP Unicast.
      //   RtspMulticast - RTSP streaming RTP via UDP Multicast.
      //   RTSP - RTSP streaming RTP over TCP.
      //   RtspOverHttp - Tunneling both the RTSP control channel and the RTP stream over HTTP or HTTPS.

      // For backwards compatibility this function will convert Media1 Stream and Transport Protocol to a Media2 protocol
      if (protocol === 'HTTP') { protocol = 'RtspOverHttp'; }
      if (protocol === 'TCP') { protocol = 'RTSP'; }
      if (protocol === 'UDP' && stream === 'RTP-Unicast') { protocol = 'RtspUnicast'; }
      if (protocol === 'UDP' && stream === 'RTP-Multicast') { protocol = 'RtspMulticast'; }

      // Profile T request using Media2
      const [data] = await this.onvif.request({
        service : 'media2',
        body    : '<GetStreamUri xmlns="http://www.onvif.org/ver20/media/wsdl">'
          + `<Protocol>${protocol}</Protocol>`
          + `<ProfileToken>${profileToken || this.onvif.activeSource!.profileToken}</ProfileToken>`
          + '</GetStreamUri>',
      });
      return linerase(data).getStreamUriResponse;
    }
    // Original (v.1.0)  ONVIF Specification for Media (used in Profile S)
    const [data] = await this.onvif.request({
      service : 'media',
      body    : '<GetStreamUri xmlns="http://www.onvif.org/ver10/media/wsdl">'
        + '<StreamSetup>'
        + `<Stream xmlns="http://www.onvif.org/ver10/schema">${stream}</Stream>`
        + '<Transport xmlns="http://www.onvif.org/ver10/schema">'
        + `<Protocol>${protocol || 'RTSP'}</Protocol>`
        + '</Transport>'
        + '</StreamSetup>'
        + `<ProfileToken>${profileToken || this.onvif.activeSource!.profileToken}</ProfileToken>`
        + '</GetStreamUri>',
    });
    return linerase(data).getStreamUriResponse.mediaUri;
  }

  /**
   * Receive snapshot URI
   * @param profileToken
   */
  async getSnapshotUri({ profileToken }: GetSnapshotUriOptions = {}): Promise<{uri: AnyURI}> {
    if (this.onvif.device.media2Support) {
      // Profile T request using Media2
      const [data] = await this.onvif.request({
        service : 'media2',
        body    : '<GetSnapshotUri xmlns="http://www.onvif.org/ver20/media/wsdl">'
          + `<ProfileToken>${profileToken || this.onvif.activeSource!.profileToken}</ProfileToken>`
          + '</GetSnapshotUri>',
      });
      return linerase(data).getSnapshotUriResponse;
    }
    const [data] = await this.onvif.request({
      service : 'media',
      body    : '<GetSnapshotUri xmlns="http://www.onvif.org/ver10/media/wsdl">'
        + `<ProfileToken>${profileToken || this.onvif.activeSource!.profileToken}</ProfileToken>`
        + '</GetSnapshotUri>',
    });
    return linerase(data).getSnapshotUriResponse.mediaUri;
  }

  async getOSDs({ configurationToken, OSDToken }: GetOSDs = {}): Promise<GetOSDsResponse> {
    const mediaService = (this.onvif.device.media2Support ? 'media2' : 'media');
    const mediaNS = (this.onvif.device.media2Support
      ? 'http://www.onvif.org/ver20/media/wsdl' : 'http://www.onvif.org/ver10/media/wsdl');

    const [data] = await this.onvif.request({
      service : mediaService,
      body    : `<GetOSDs xmlns="${mediaNS}" >${
        configurationToken ? `<ConfigurationToken>${configurationToken}</ConfigurationToken>` : ''
      }${
        OSDToken ? `<OSDToken>${configurationToken}</OSDToken>` : ''
      }</GetOSDs>`,
    });
    // this.videoSources = linerase(data).getVideoSourcesResponse.videoSources;
    return linerase(data[0].getOSDsResponse[0], { array : ['OSDs'] });
  }
}
