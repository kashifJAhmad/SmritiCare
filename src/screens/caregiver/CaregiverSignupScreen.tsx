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

type CaregiverSignupScreenProps = {
    onSignup: () => void;
    onLogin: () => void;
    onBack?: () => void;
};

const COLORS = {
    primary: "#00450D",
    primaryContainer: "#1B5E20",
    background: "#FCF9F8",
    surface: "#FFFFFF",
    text: "#1B1C1C",
    textSecondary: "#41493E",
    outline: "#717A6D",
    lightBorder: "#C0C9BB",
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
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const handleSignup = async () => {
        if (!fullName.trim()) {
            Alert.alert(
                "Missing information",
                "Please enter your full name.",
            );
            return;
        }

        if (!email.trim()) {
            Alert.alert(
                "Missing information",
                "Please enter your email address.",
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
                "Password too short",
                "Your password must be at least 6 characters long.",
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

            /*
             * BACKEND CONNECTION — TO BE ADDED BY KASHIF
             *
             * Later this section will call the caregiver signup API.
             *
             * For now we simulate a successful signup so the
             * caregiver frontend flow can be developed independently.
             */

            await new Promise((resolve) => setTimeout(resolve, 700));

            setLoading(false);

            Alert.alert(
                "Account created",
                "Your SmritiCare caregiver account has been created successfully.",
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
                    : "Unable to create your account. Please try again.";

            Alert.alert("Signup failed", message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    {onBack ? (
                        <Pressable
                            onPress={onBack}
                            style={styles.backButton}
                            hitSlop={10}
                            disabled={loading}
                        >
                            <MaterialIcons
                                name="arrow-back"
                                size={27}
                                color={COLORS.primary}
                            />
                        </Pressable>
                    ) : (
                        <View style={styles.backPlaceholder} />
                    )}

                    <Image
                        source={require("../../../assets/images/logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <View style={styles.backPlaceholder} />
                </View>

                {/* Title */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>
                        Create Caregiver Account
                    </Text>

                    <Text style={styles.subtitle}>
                        Create your SmritiCare caregiver account to support
                        your loved one.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.formCard}>
                    <Text style={styles.sectionTitle}>
                        Caregiver Information
                    </Text>

                    {/* Full Name */}
                    <Text style={styles.label}>Full Name</Text>

                    <TextInput
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        placeholderTextColor="#8A9187"
                        style={styles.input}
                        editable={!loading}
                        autoCapitalize="words"
                    />

                    {/* Email */}
                    <Text style={styles.label}>Email</Text>

                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        placeholderTextColor="#8A9187"
                        style={styles.input}
                        editable={!loading}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    {/* Phone */}
                    <Text style={styles.label}>Phone Number</Text>

                    <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter your phone number"
                        placeholderTextColor="#8A9187"
                        style={styles.input}
                        editable={!loading}
                        keyboardType="phone-pad"
                    />

                    {/* Password */}
                    <Text style={styles.label}>Password</Text>

                    <View style={styles.passwordContainer}>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Create a password"
                            placeholderTextColor="#8A9187"
                            style={styles.passwordInput}
                            editable={!loading}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Pressable
                            onPress={() =>
                                setShowPassword((value) => !value)
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
                                size={22}
                                color={COLORS.textSecondary}
                            />
                        </Pressable>
                    </View>

                    <Text style={styles.passwordHint}>
                        Password must contain at least 6 characters.
                    </Text>

                    {/* Confirm Password */}
                    <Text style={styles.label}>Confirm Password</Text>

                    <View style={styles.passwordContainer}>
                        <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm your password"
                            placeholderTextColor="#8A9187"
                            style={styles.passwordInput}
                            editable={!loading}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Pressable
                            onPress={() =>
                                setShowConfirmPassword((value) => !value)
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
                                size={22}
                                color={COLORS.textSecondary}
                            />
                        </Pressable>
                    </View>

                    {/* Create Account */}
                    <Pressable
                        onPress={handleSignup}
                        disabled={loading}
                        style={({ pressed }) => [
                            styles.signupButton,
                            pressed &&
                            !loading &&
                            styles.buttonPressed,
                            loading && styles.buttonDisabled,
                        ]}
                    >
                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color={COLORS.white}
                            />
                        ) : (
                            <>
                                <Text style={styles.signupButtonText}>
                                    Create Account
                                </Text>

                                <MaterialIcons
                                    name="arrow-forward"
                                    size={22}
                                    color={COLORS.white}
                                />
                            </>
                        )}
                    </Pressable>
                </View>

                {/* Login */}
                <View style={styles.loginSection}>
                    <Text style={styles.loginText}>
                        Already have a caregiver account?
                    </Text>

                    <Pressable
                        onPress={onLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginLink}>
                            Sign In
                        </Text>
                    </Pressable>
                </View>

                {/* Security */}
                <View style={styles.securityCard}>
                    <MaterialIcons
                        name="lock"
                        size={22}
                        color={COLORS.primary}
                    />

                    <View style={styles.securityTextContainer}>
                        <Text style={styles.securityTitle}>
                            Your information is secure
                        </Text>

                        <Text style={styles.securityText}>
                            Your caregiver information is protected and
                            securely handled by SmritiCare.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    scrollContent: {
        paddingHorizontal: 22,
        paddingTop: 22,
        paddingBottom: 40,
    },

    header: {
        height: 58,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.white,
    },

    backPlaceholder: {
        width: 48,
        height: 48,
    },

    logo: {
        width: 55,
        height: 55,
    },

    titleSection: {
        marginTop: 24,
        marginBottom: 24,
    },

    title: {
        fontSize: 30,
        lineHeight: 38,
        fontWeight: "700",
        color: COLORS.primary,
    },

    subtitle: {
        marginTop: 8,
        fontSize: 16,
        lineHeight: 24,
        color: COLORS.textSecondary,
    },

    formCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 20,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 20,
    },

    label: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.text,
        marginBottom: 8,
        marginTop: 14,
    },

    input: {
        minHeight: 54,
        borderWidth: 1,
        borderColor: COLORS.lightBorder,
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: COLORS.text,
        backgroundColor: COLORS.white,

        ...(Platform.OS === "web"
            ? ({ outlineStyle: "none" } as any)
            : {}),
    },

    passwordContainer: {
        minHeight: 54,
        borderWidth: 1,
        borderColor: COLORS.lightBorder,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.white,
    },

    passwordInput: {
        flex: 1,
        minHeight: 52,
        paddingHorizontal: 16,
        fontSize: 16,
        color: COLORS.text,

        ...(Platform.OS === "web"
            ? ({ outlineStyle: "none" } as any)
            : {}),
    },

    eyeButton: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },

    passwordHint: {
        marginTop: 6,
        fontSize: 13,
        color: COLORS.textSecondary,
    },

    signupButton: {
        marginTop: 26,
        minHeight: 56,
        borderRadius: 16,
        backgroundColor: COLORS.primaryContainer,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        gap: 8,
    },

    signupButtonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: "700",
    },

    buttonPressed: {
        opacity: 0.8,
    },

    buttonDisabled: {
        opacity: 0.65,
    },

    loginSection: {
        alignItems: "center",
        marginTop: 22,
        gap: 5,
    },

    loginText: {
        fontSize: 15,
        color: COLORS.textSecondary,
        textAlign: "center",
    },

    loginLink: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.primary,
    },

    securityCard: {
        marginTop: 24,
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#EAF4EA",

        flexDirection: "row",
        alignItems: "flex-start",

        gap: 12,
    },

    securityTextContainer: {
        flex: 1,
    },

    securityTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.primary,
    },

    securityText: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 19,
        color: COLORS.textSecondary,
    },
});