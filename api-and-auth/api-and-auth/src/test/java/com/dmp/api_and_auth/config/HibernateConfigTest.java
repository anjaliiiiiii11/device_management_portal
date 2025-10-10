//package com.dmp.api_and_auth.config;
//
//import org.junit.jupiter.api.Test;
//import org.mockito.Mockito;
//import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
//
//import javax.sql.DataSource;
//
//import java.util.Properties;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//class HibernateConfigTest {
//
//    private final HibernateConfig hibernateConfig = new HibernateConfig();
//
//    @Test
//    void testDataSourceCreation() {
//        DataSource dataSource = hibernateConfig.dataSource();
//        assertNotNull(dataSource, "DataSource should not be null");
//    }
//
//    @Test
//    void testSessionFactoryCreation() {
//        DataSource mockDataSource = Mockito.mock(DataSource.class);
//        LocalSessionFactoryBean sessionFactory = hibernateConfig.sessionFactory(mockDataSource);
//
//        assertNotNull(sessionFactory, "SessionFactory should not be null");
//
//        Properties props = sessionFactory.getHibernateProperties();
//        assertEquals("org.hibernate.dialect.MySQL8Dialect", props.getProperty("hibernate.dialect"));
//        assertEquals("update", props.getProperty("hibernate.hbm2ddl.auto"));
//    }
//}
