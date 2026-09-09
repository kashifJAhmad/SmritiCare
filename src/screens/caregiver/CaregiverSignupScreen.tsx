import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { caregiverSignup } from "../../services/auth";

type CaregiverSignupScreenProps = {
    onSignup: () => void;
    onLogin: () => void;
    onBack?: () => void;
};

const COLORS = {
    background: "#FCF9F8",
    primary: "#00450D",
    navy: "#102A56",
    textSecondary: "#41493E",
    border: "#C0C9BB",
    green: "#4FA56A",
    white: "#FFFFFF",
};

export default function CaregiverSignupScreen({
    onSignup,
    onLogin,
    onBack,
}: CaregiverSignupScreenProps) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        const cleanName = fullName.trim();
        const cleanEmail = email.trim();

        if (!cleanName) {
            Alert.alert(
                "Missing information",
                "Please enter your full name.",
            );
            return;
        }

        if (!cleanEmail) {
            Alert.alert(
                "Missing information",
                "Please enter your email.",
            );
            return;
        }

        if (!password) {
            Alert.alert(
                "Missing information",
                "Please enter a password.",
            );
            return;
        }

        if (password.length < 6) {
            Alert.alert(
                "Invalid password",
                "Password must be at least 6 characters.",
            );
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert(
                "Passwords do not match",
                "Please make sure both passwords are the same.",
            );
            return;
        }

        try {
            setLoading(true);

            await caregiverSignup(
                cleanName,
                cleanEmail,
                password,
            );

            setLoading(false);

            Alert.alert(
                "Account Created",
                "Your caregiver account has been created successfully.",
                [
                    {
                        text: "Continue",
                        onPress: onSignup,
                    },
                ],
            );
        } catch (error) {
            setLoading(false);

            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to create your account.";

            Alert.alert(
                "Sign Up Failed",
                message,
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.safeArea}
            behavior={
                Platform.OS === "ios"
                    ? "padding"
                    : undefined
            }
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Pressable
                        onPress={onBack}
                        disabled={loading}
                        hitSlop={10}
                        style={styles.backButton}
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={28}
                            color={COLORS.primary}
                        />
                    </Pressable>

                    <Text style={styles.headerTitle}>
                        Caregiver Sign Up
                    </Text>

                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.logoCircle}>
                    <Image
                        source={require("../../../assets/images/logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.title}>
                    Create Account
                </Text>

                <Text style={styles.subtitle}>
                    Create your SmritiCare caregiver account
                </Text>

                <View style={styles.form}>
                    <Text style={styles.label}>
                        Full Name
                    </Text>

                    <View style={styles.inputContainer}>
                        <MaterialIcons
                            name="person"
                            size={23}
                            color={COLORS.green}
                        />

                        <TextInput
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter your full name"
                            placeholderTextColor="#8A9187"
                            autoCapitalize="words"
                            autoCorrect={false}
                            editable={!loading}
                            style={styles.input}
                        />
                    </View>

                    <Text
                        style={[
                            styles.label,
                            styles.nextLabel,
                        ]}
                    >
                        Email Address
                    </Text>

                    <View style={styles.inputContainer}>
                        <MaterialIcons
                            name="email"
                            size={23}
                            color={COLORS.green}
                        />

                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor="#8A9187"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                            style={styles.input}
                        />
                    </View>

                    <Text
                        style={[
                            styles.label,
                            styles.nextLabel,
                        ]}
                    >
                        Password
                    </Text>

                    <View style={styles.inputContainer}>
                        <MaterialIcons
                            name="lock"
                            size={23}
                            color={COLORS.green}
                        />

                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Create a password"
                            placeholderTextColor="#8A9187"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                            style={styles.input}
                        />

                        <Pressable
                            onPress={() =>
                                setShowPassword(
                                    (value) => !value,
                                )
                            }
                            disabled={loading}
                            hitSlop={10}
                            style={styles.eyeButton}
                        >
                            <MaterialIcons
                                name={
                                    showPassword
                                        ? "visibility"
                                        : "visibility-off"
                                }
                                size={23}
                                color="#718090"
                            />
                        </Pressable>
                    </View>

                    <Text
                        style={[
                            styles.label,
                            styles.nextLabel,
                        ]}
                    >
                        Confirm Password
                    </Text>

                    <View style={styles.inputContainer}>
                        <MaterialIcons
                            name="lock-outline"
                            size={23}
                            color={COLORS.green}
                        />

                        <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm your password"
                            placeholderTextColor="#8A9187"
                            secureTextEntry={
                                !showConfirmPassword
                            }
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                            style={styles.input}
                        />

                        <Pressable
                            onPress={() =>
                                setShowConfirmPassword(
                                    (value) => !value,
                                )
                            }
                            disabled={loading}
                            hitSlop={10}
                            style={styles.eyeButton}
                        >
                            <MaterialIcons
                                name={
                                    showConfirmPassword
                                        ? "visibility"
                                        : "visibility-off"
                                }
                                size={23}
                                color="#718090"
                            />
                        </Pressable>
                    </View>

                    <Pressable
                        onPress={handleSignup}
                        disabled={loading}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.pressed,
                            loading &&
                                styles.buttonDisabled,
                        ]}
                    >
                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color={COLORS.white}
                            />
                        ) : (
                            <>
                                <MaterialIcons
                                    name="person-add"
                                    size={23}
                                    color={COLORS.white}
                                />

                                <Text
                                    style={
                                        styles.primaryButtonText
                                    }
                                >
                                    Create Caregiver Account
                                </Text>
                            </>
                        )}
                    </Pressable>
                </View>

                <View style={styles.loginRow}>
                    <Text style={styles.accountText}>
                        Already have an account?
                    </Text>

                    <Pressable
                        onPress={onLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginText}>
                            {" "}Sign In
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.securityBox}>
                    <MaterialIcons
                        name="verified-user"
                        size={25}
                        color={COLORS.primary}
                    />

                    <Text style={styles.securityText}>
                        Your caregiver account is protected by
                        SmritiCare authentication.
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    container: {
        flexGrow: 1,
        alignItems: "center",
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    header: {
        width: "100%",
        height: 64,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    backButton: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },

    headerTitle: {
        fontSize: 21,
        fontWeight: "800",
        color: COLORS.primary,
    },

    headerSpacer: {
        width: 48,
    },

    logoCircle: {
        width: 125,
        height: 125,
        borderRadius: 63,
        backgroundColor: COLORS.white,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        overflow: "hidden",
        elevation: 4,
    },

    logo: {
        width: 110,
        height: 110,
    },

    title: {
        marginTop: 22,
        fontSize: 30,
        lineHeight: 38,
        fontWeight: "800",
        color: COLORS.navy,
        textAlign: "center",
    },

    subtitle: {
        marginTop: 7,
        marginBottom: 27,
        fontSize: 17,
        lineHeight: 25,
        color: COLORS.textSecondary,
        textAlign: "center",
    },

    form: {
        width: "100%",
        maxWidth: 520,
    },

    label: {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.navy,
    },

    nextLabel: {
        marginTop: 18,
    },

    inputContainer: {
        minHeight: 58,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 15,
        backgroundColor: COLORS.white,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },

    input: {
        flex: 1,
        marginLeft: 12,
        minHeight: 54,
        fontSize: 16,
        color: "#1B2D42",

        ...(Platform.OS === "web"
            ? ({ outlineStyle: "none" } as any)
            : {}),
    },

    eyeButton: {
        width: 42,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },

    primaryButton: {
        minHeight: 58,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 26,
        paddingHorizontal: 18,
        elevation: 3,
    },

    primaryButtonText: {
        marginLeft: 10,
        fontSize: 17,
        fontWeight: "800",
        color: COLORS.white,
    },

    pressed: {
        opacity: 0.8,
        transform: [
            {
                scale: 0.99,
            },
        ],
    },

    buttonDisabled: {
        opacity: 0.65,
    },

    loginRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 22,
        flexWrap: "wrap",
    },

    accountText: {
        fontSize: 15,
        color: COLORS.textSecondary,
    },

    loginText: {
        fontSize: 15,
        fontWeight: "800",
        color: COLORS.primary,
    },

    securityBox: {
        width: "100%",
        maxWidth: 520,
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#EDF7F0",
        borderRadius: 16,
        padding: 15,
        marginTop: 28,
    },

    securityText: {
        flex: 1,
        marginLeft: 11,
        fontSize: 13.5,
        lineHeight: 20,
        color: COLORS.textSecondary,
    },
});