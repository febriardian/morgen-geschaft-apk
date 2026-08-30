import { router } from "expo-router";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { Field, PrimaryButton, Screen } from "@/components/ui";
import { COLORS } from "@/constants/store";
import { useStore } from "@/context/store-context";

export default function LoginScreen() {
  const { locale, requestOtp, verifyOtp } = useStore();
  const en = locale === "en";
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const send = async () => {
    setLoading(true);
    try {
      const result = await requestOtp(email.trim(), referralCode.trim());
      setChallengeId(result.challengeId);
      Alert.alert(
        en ? "Code sent" : "Kode terkirim",
        en
          ? "Check your inbox for the six-digit code."
          : "Cek emailmu untuk kode enam digit.",
      );
    } catch (error) {
      Alert.alert(
        en ? "Unable to send code" : "Kode belum dapat dikirim",
        (error as Error).message,
      );
    } finally {
      setLoading(false);
    }
  };
  const verify = async () => {
    setLoading(true);
    try {
      await verifyOtp(email.trim(), challengeId, code.trim());
      router.back();
    } catch (error) {
      Alert.alert(
        en ? "Invalid code" : "Kode tidak valid",
        (error as Error).message,
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Screen style={styles.content}>
      <View style={styles.logoWrap}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="Logo Morgen Geschäft"
        />
      </View>
      <Text style={styles.title}>
        {en
          ? "Welcome to Morgen Geschäft"
          : "Selamat datang di Morgen Geschäft"}
      </Text>
      <Text style={styles.subtitle}>
        {en
          ? "No password needed. We will send a secure OTP to your email."
          : "Tanpa kata sandi. Kami akan mengirim OTP aman ke emailmu."}
      </Text>
      {challengeId ? (
        <>
          <Field label="Email" value={email} editable={false} />
          <Field
            label={en ? "Six-digit code" : "Kode enam digit"}
            value={code}
            onChangeText={(value) =>
              setCode(value.replace(/\D/g, "").slice(0, 6))
            }
            keyboardType="number-pad"
            placeholder="000000"
            textContentType="oneTimeCode"
          />
          <PrimaryButton
            label={en ? "Verify and sign in" : "Verifikasi dan masuk"}
            loading={loading}
            disabled={code.length !== 6}
            onPress={() => void verify()}
          />
          <PrimaryButton
            label={en ? "Use another email" : "Ganti email"}
            variant="outline"
            onPress={() => {
              setChallengeId("");
              setCode("");
            }}
          />
        </>
      ) : (
        <>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="nama@email.com"
          />
          <Field
            label={en ? "Referral code (optional)" : "Kode referral (opsional)"}
            value={referralCode}
            onChangeText={setReferralCode}
            autoCapitalize="characters"
            placeholder="MORGENXXXX"
          />
          <PrimaryButton
            label={en ? "Send OTP" : "Kirim kode OTP"}
            loading={loading}
            disabled={!email.includes("@")}
            onPress={() => void send()}
          />
        </>
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: { paddingTop: 30 },
  logoWrap: {
    alignSelf: "center",
    width: 138,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 138, height: 104 },
  title: {
    color: COLORS.navy,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.muted,
    lineHeight: 21,
    textAlign: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
});
