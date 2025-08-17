const express = require("express");
const passport = require("passport");
const router = express.Router();

// Bắt đầu OAuth Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback từ Google
router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("/dashboard"); // Trang chính sau khi đăng nhập
    }
);

module.exports = router;
