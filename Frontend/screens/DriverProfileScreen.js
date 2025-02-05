/**
 * Driver Profile Screen
 * 
 * This screen displays the driver's profile information and allows them to 
 * view their delivery history, update their vehicle information, and manage their documents.
 * 
 * @param {object} navigation - The navigation object passed from the parent screen.
 */
const DriverProfileScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [driverData, setDriverData] = useState(null);
    const [deliveryHistory, setDeliveryHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [earnings, setEarnings] = useState(0);

    useEffect(() => {
        fetchDriverData();
    }, []);

    /**
     * Fetches the driver's profile information and delivery history from the API.
     */
    const fetchDriverData = async () => {
        try {
            // Fetch driver profile details
            const driverResponse = await fetch(`http://192.168.1.2:5000/api/drivers/${user.id}`);
            const driverData = await driverResponse.json();

            // Fetch delivery history
            const historyResponse = await fetch(`http://192.168.1.2:5000/api/drivers/${user.id}/deliveries`);
            const historyData = await historyResponse.json();

            // Fetch earnings
            const earningsResponse = await fetch(`http://192.168.1.2:5000/api/drivers/${user.id}/earnings`);
            const earningsData = await earningsResponse.json();

            setDriverData(driverData);
            setDeliveryHistory(historyData);
            setEarnings(earningsData.total_earnings);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching driver data:', error);
            Alert.alert('Error', 'Failed to load driver profile');
            setLoading(false);
        }
    };

    /**
     * Renders a single delivery item in the delivery history list.
     * 
     * @param {object} item - The delivery item data from the API.
     */
    const renderDeliveryItem = ({ item }) => (
        <View style={styles.deliveryItem}>
            <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryOrderId}>Order #{item.order_id}</Text>
                <Text style={styles.deliveryDate}>{new Date(item.delivery_date).toLocaleDateString()}</Text>
                <Text style={styles.deliveryEarnings}>${item.earnings.toFixed(2)}</Text>
                <Text style={styles.deliveryStatus}>{item.status}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#1F654C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Driver Profile Header */}
            <View style={styles.profileHeader}>
                <Icon name="car" size={50} color="#1F654C" />
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileSubtitle}>Verified Driver</Text>
            </View>

            {/* Earnings Summary */}
            <View style={styles.earningsContainer}>
                <Text style={styles.earningsTitle}>Total Earnings</Text>
                <Text style={styles.earningsAmount}>${earnings.toFixed(2)}</Text>
                <TouchableOpacity 
                    style={styles.withdrawButton}
                    onPress={() => navigation.navigate('WithdrawEarnings')}
                >
                    <Text style={styles.withdrawButtonText}>Withdraw</Text>
                </TouchableOpacity>
            </View>

            {/* Vehicle Information */}
            <View style={styles.vehicleContainer}>
                <Text style={styles.sectionTitle}>Vehicle Details</Text>
                <Text style={styles.vehicleText}>Make: {driverData.vehicle_make}</Text>
                <Text style={styles.vehicleText}>Model: {driverData.vehicle_model}</Text>
                <Text style={styles.vehicleText}>Year: {driverData.vehicle_year}</Text>
                <Text style={styles.vehicleText}>License Plate: {driverData.license_plate}</Text>
            </View>

            {/* Delivery History */}
            <View style={styles.deliveryHistoryContainer}>
                <Text style={styles.sectionTitle}>Delivery History</Text>
                <FlatList
                    data={deliveryHistory}
                    renderItem={renderDeliveryItem}
                    keyExtractor={(item) => item.order_id.toString()}
                    ListEmptyComponent={
                        <Text style={styles.emptyListText}>No delivery history yet</Text>
                    }
                />
            </View>

            {/* Driver Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('UpdateVehicleInfo')}
                >
                    <Icon name="construct" size={24} color="#1F654C" />
                    <Text style={styles.actionButtonText}>Update Vehicle Info</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('DriverDocuments')}
                >
                    <Icon name="document" size={24} color="#1F654C" />
                    <Text style={styles.actionButtonText}>Manage Documents</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F4F4',
        padding: 15,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 10,
    },
    profileSubtitle: {
        color: '#1F654C',
        fontSize: 16,
    },
    earningsContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    earningsTitle: {
        fontSize: 16,
        color: '#666',
    },
    earningsAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F654C',
        marginVertical: 10,
    },
    withdrawButton: {
        backgroundColor: '#1F654C',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    withdrawButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    vehicleContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    vehicleText: {
        fontSize: 16,
        marginBottom: 5,
    },
    deliveryHistoryContainer: {
        flex: 1,
        marginBottom: 20,
    },
    deliveryItem: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    deliveryOrderId: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    deliveryDate: {
        color: '#666',
    },
    deliveryEarnings: {
        color: '#1F654C',
        fontWeight: 'bold',
    },
    deliveryStatus: {
        marginTop: 5,
        color: '#666',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        flex: 1,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionButtonText: {
        marginLeft: 10,
        fontWeight: 'bold',
    },
    emptyListText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },
});

export default DriverProfileScreen;
