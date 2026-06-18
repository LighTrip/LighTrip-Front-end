import { View } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { CATEGORY_COLORS, CATEGORY_PATHS, GREEN } from "../../constants/mapConstants";

export function UserLocationMarker() {
  return (
    <View style={{ width: 40, height: 40 }}>
      <Svg width={40} height={40} viewBox="0 0 40 40">
        <Circle cx={20} cy={20} r={13} fill="rgba(52,211,153,0.25)" stroke="rgba(52,211,153,0.5)" strokeWidth={1.5} />
        <Circle cx={20} cy={20} r={6} fill={GREEN} stroke="white" strokeWidth={2} />
      </Svg>
    </View>
  );
}

function GlowMarker({
  cx, cy, r, rMid, rInner, main, light, children,
}: {
  cx: number; cy: number; r: number; rMid: number; rInner: number;
  main: string; light: string; children?: React.ReactNode;
}) {
  return (
    <>
      <Defs>
        <RadialGradient id="gm_out" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={main} stopOpacity={0.4} />
          <Stop offset="100%" stopColor={main} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="gm_in" cx="40%" cy="35%" r="60%">
          <Stop offset="0%" stopColor={light} stopOpacity={1} />
          <Stop offset="100%" stopColor={main} stopOpacity={1} />
        </RadialGradient>
        <ClipPath id="gm_clip">
          <Circle cx={cx} cy={cy} r={rInner} />
        </ClipPath>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill="url(#gm_out)" />
      <Circle cx={cx} cy={cy} r={rMid} fill={main} fillOpacity={0.2} />
      <Circle cx={cx} cy={cy} r={rInner} fill="url(#gm_in)" />
      <Circle cx={cx - 5} cy={cy - 6} r={Math.round(rInner * 0.28)} fill="white" fillOpacity={0.25} />
      {children}
    </>
  );
}

export function PassportMarker({ category }: { spaceName: string; category: string }) {
  const { main, light } = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.ETC;
  const paths = CATEGORY_PATHS[category] ?? CATEGORY_PATHS.ETC;
  const scale = 18 / 24;
  const offset = 28 - 9;
  const gradOut = `pm_o_${category}`;
  const gradIn = `pm_i_${category}`;
  return (
    <View style={{ width: 56, height: 56 }}>
      <Svg width={56} height={56} viewBox="0 0 56 56">
        <Defs>
          <RadialGradient id={gradOut} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={main} stopOpacity={0.4} />
            <Stop offset="100%" stopColor={main} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={gradIn} cx="40%" cy="35%" r="60%">
            <Stop offset="0%" stopColor={light} stopOpacity={1} />
            <Stop offset="100%" stopColor={main} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Circle cx={28} cy={28} r={28} fill={`url(#${gradOut})`} />
        <Circle cx={28} cy={28} r={20} fill={main} fillOpacity={0.18} />
        <Circle cx={28} cy={28} r={15} fill={`url(#${gradIn})`} />
        <Circle cx={23} cy={22} r={4} fill="white" fillOpacity={0.25} />
        <G transform={`translate(${offset}, ${offset}) scale(${scale})`}>
          {paths.map((d, i) => <Path key={i} d={d} fill="white" />)}
        </G>
      </Svg>
    </View>
  );
}

export function ServerClusterMarker({ count, category }: { count: number; category: string }) {
  const { main, light } = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.ETC;
  return (
    <View style={{ width: 56, height: 56 }}>
      <Svg width={56} height={56} viewBox="0 0 56 56">
        <GlowMarker cx={28} cy={28} r={28} rMid={20} rInner={15} main={main} light={light}>
          <SvgText x={28} y={33} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold" clipPath="url(#gm_clip)">
            {String(count)}
          </SvgText>
        </GlowMarker>
      </Svg>
    </View>
  );
}

export function FrontClusterMarker({ count, category }: { count: number; category: string }) {
  const { main, light } = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.ETC;
  return (
    <View style={{ width: 64, height: 64 }}>
      <Svg width={64} height={64} viewBox="0 0 64 64">
        <GlowMarker cx={32} cy={32} r={32} rMid={23} rInner={17} main={main} light={light}>
          <SvgText x={32} y={38} textAnchor="middle" fill="white" fontSize={15} fontWeight="bold" clipPath="url(#gm_clip)">
            {String(count)}
          </SvgText>
        </GlowMarker>
      </Svg>
    </View>
  );
}
