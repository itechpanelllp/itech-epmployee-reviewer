
// dashboard view page
const dashboardView = async (req, res) => {
    try {
       
        res.render('dashboard/dashboard', {
            title: res.__("Dashboard"),
            session: req.session,
            
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
        
    }
}

module.exports = {
    dashboardView
}
