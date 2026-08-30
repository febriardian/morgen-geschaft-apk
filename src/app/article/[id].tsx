import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { EmptyState, Screen, StoreHeader } from "@/components/ui";
import { absoluteAssetUrl, COLORS } from "@/constants/store";
import { useStore } from "@/context/store-context";

type ContentBlock = {
  type: "heading" | "list" | "paragraph";
  text?: string;
  items?: string[];
};

function parseContent(content: string): ContentBlock[] {
  return String(content || "")
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const clean = part.replace(/\*\*/g, "");
      if (/^#{1,3}\s/.test(clean))
        return { type: "heading", text: clean.replace(/^#{1,3}\s+/, "") };
      const lines = clean
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (lines.some((line) => /^[-•]\s+/.test(line))) {
        const intro = lines.filter((line) => !/^[-•]\s+/.test(line)).join("\n");
        const items = lines
          .filter((line) => /^[-•]\s+/.test(line))
          .map((line) => line.replace(/^[-•]\s+/, ""));
        return { type: "list", text: intro, items };
      }
      return {
        type: /^\d+\.\s/.test(clean) ? "heading" : "paragraph",
        text: clean,
      };
    });
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale, blogs } = useStore();
  const en = locale === "en";
  const post = blogs.find((item) => item.id === id);
  if (!post)
    return (
      <Screen>
        <StoreHeader title={en ? "Article" : "Artikel"} showBack />
        <EmptyState
          icon="book-outline"
          title={en ? "Article not found" : "Artikel tidak ditemukan"}
          message={
            en ? "This article is unavailable." : "Artikel ini belum tersedia."
          }
        />
      </Screen>
    );

  const title = en ? post.titleEn || post.title : post.title;
  const content = en ? post.contentEn || post.content : post.content;
  const cover = post.coverImage || post.image;
  const share = () =>
    void Share.share({
      title,
      message: `${title}\nhttps://morgengeschaft.com/${en ? "en/articles" : "id/artikel"}/${post.id}`,
    });

  return (
    <Screen>
      <StoreHeader
        title={en ? "Article" : "Artikel"}
        subtitle={en ? "Morgen Journal" : "Jurnal Morgen"}
        showBack
      />
      {cover ? (
        <Image
          source={{ uri: absoluteAssetUrl(cover) }}
          style={styles.cover}
          contentFit="cover"
          transition={180}
        />
      ) : null}
      <Text style={styles.category}>{post.category || "JOURNAL"}</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {post.date
            ? new Date(post.date).toLocaleDateString(en ? "en-ID" : "id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : ""}
        </Text>
        <Text style={styles.metaText}>
          {en ? post.readTimeEn || post.readTime : post.readTime}
        </Text>
        <Pressable style={styles.share} onPress={share}>
          <Ionicons
            name="share-social-outline"
            size={16}
            color={COLORS.orange}
          />
          <Text style={styles.shareText}>{en ? "Share" : "Bagikan"}</Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        {parseContent(String(content || "")).map((block, index) => {
          if (block.type === "heading")
            return (
              <Text key={index} style={styles.heading}>
                {block.text}
              </Text>
            );
          if (block.type === "list")
            return (
              <View key={index} style={styles.block}>
                {block.text ? (
                  <Text style={styles.paragraph}>{block.text}</Text>
                ) : null}
                {block.items?.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          return (
            <Text key={index} style={styles.paragraph}>
              {block.text}
            </Text>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: "100%",
    height: 230,
    borderRadius: 24,
    backgroundColor: COLORS.paper,
  },
  category: {
    color: COLORS.orange,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.navy,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "900",
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  metaText: { color: COLORS.muted, fontSize: 12 },
  share: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: "auto",
  },
  shareText: { color: COLORS.orange, fontSize: 12, fontWeight: "800" },
  content: {
    backgroundColor: COLORS.paper,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 19,
    gap: 16,
  },
  block: { gap: 9 },
  heading: {
    color: COLORS.navy,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
    marginTop: 4,
  },
  paragraph: { color: COLORS.ink, fontSize: 15, lineHeight: 24 },
  bulletRow: { flexDirection: "row", gap: 9, paddingLeft: 3 },
  bullet: {
    color: COLORS.orange,
    fontWeight: "900",
    fontSize: 17,
    lineHeight: 23,
  },
  bulletText: { flex: 1, color: COLORS.ink, fontSize: 15, lineHeight: 23 },
});
