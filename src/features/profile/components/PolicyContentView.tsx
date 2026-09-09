import { StyleSheet, Text, View } from "react-native";
import { PolicyBlock } from "../data/policyContent";

interface PolicyContentViewProps {
  title: string;
  intro?: string[];
  noticeDate: string;
  effectiveDate: string;
  blocks: PolicyBlock[];
}

export default function PolicyContentView({
  title,
  intro,
  noticeDate,
  effectiveDate,
  blocks,
}: PolicyContentViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.docTitle}>{title}</Text>
      <Text style={styles.docDate}>
        공고일자 {noticeDate} · 시행일자 {effectiveDate}
      </Text>

      {intro?.map((paragraph, index) => (
        <Text key={`intro-${index}`} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}

      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <Text key={index} style={styles.heading}>
                {block.text}
              </Text>
            );
          case "subheading":
            return (
              <Text key={index} style={styles.subheading}>
                {block.text}
              </Text>
            );
          case "paragraph":
            return (
              <Text key={index} style={styles.paragraph}>
                {block.text}
              </Text>
            );
          case "quote":
            return (
              <View key={index} style={styles.quoteBox}>
                <Text style={styles.quoteText}>{block.text}</Text>
              </View>
            );
          case "list":
            return (
              <View key={index} style={styles.list}>
                {block.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.listItem}>
                    <Text style={styles.listBullet}>•</Text>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          case "divider":
            return <View key={index} style={styles.divider} />;
          default:
            return null;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  docTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  docDate: {
    fontSize: 12,
    color: "#8A8A8A",
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 20,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 12,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#3A3A3A",
    marginBottom: 8,
  },
  list: {
    marginBottom: 8,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  listBullet: {
    fontSize: 14,
    lineHeight: 22,
    color: "#3A3A3A",
    marginRight: 6,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#3A3A3A",
  },
  quoteBox: {
    backgroundColor: "#F3F5F9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#5A5A5A",
  },
  divider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginVertical: 16,
  },
});
