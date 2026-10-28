import Svg, { Circle, Path } from 'react-native-svg';
import { tokens } from '../theme/tokens';

/** Luna's signal mark: the four-point spark on a white disc. Geometry from Figma. */
export function LunaSignalIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessibilityElementsHidden>
      <Circle cx={16} cy={16} r={16} fill={tokens.color.surface.DEFAULT} />
      <Path
        d="M15.2781 20.8177C15.1776 20.2234 14.9124 19.5834 14.4827 18.8977C14.053 18.2029 13.4404 17.5583 12.645 16.964C11.8587 16.3697 11.0724 15.9903 10.2861 15.8257V15.2497C11.0633 15.0669 11.8084 14.7286 12.5216 14.2349C13.2438 13.732 13.8473 13.1286 14.3318 12.4246C14.8256 11.7023 15.141 10.9892 15.2781 10.2852H15.8541C15.9364 10.7423 16.101 11.2132 16.3478 11.6977C16.5947 12.1732 16.9101 12.6303 17.2941 13.0692C17.6873 13.4989 18.1261 13.8874 18.6107 14.2349C19.333 14.7469 20.069 15.0852 20.8187 15.2497V15.8257C20.3158 15.9263 19.7947 16.132 19.2553 16.4429C18.725 16.7537 18.2313 17.124 17.7741 17.5537C17.317 17.9743 16.9421 18.4177 16.6496 18.884C16.2198 19.5697 15.9547 20.2143 15.8541 20.8177H15.2781Z"
        fill={tokens.color.brand.DEFAULT}
      />
    </Svg>
  );
}
