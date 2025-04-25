import {
  Box,
  Button,
  Link as ChakraLink,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/api.js";
import { EMAIL_PATTERN } from "../constants/email.js";

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectUrl = location.state?.redirectUrl || "/";
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors, isValid },
  } = useForm({ defaultValues: { email: "", password: "" } });

  const { mutate: signIn, isPending, isError } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate(redirectUrl, {
        replace: true,
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    signIn(data);
  };

  return (
    <Flex minH="100vh" align="center" justify="center">
      <Container mx="auto" maxW="md" py={12} px={6} textAlign="center">
        <Heading fontSize="4xl" mb={8}>
          Sign in to your account
        </Heading>
        <Box rounded="lg" bg="gray.700" boxShadow="lg" p={8}>
          {isError && (
            <Box mb={3} color="red.400">
              Invalid email or password
            </Box>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl id="email" isInvalid={Boolean(errors.email)}>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: EMAIL_PATTERN,
                      message: "Invalid email format",
                    },
                  })}
                  autoFocus
                />
                {errors.email && (
                  <Text fontSize="sm" color="red.500">
                    {errors.email.message}
                  </Text>
                )}
              </FormControl>

              <FormControl id="password" isInvalid={Boolean(errors.password)}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <Text fontSize="sm" color="red.500">
                    {errors.password.message}
                  </Text>
                )}
              </FormControl>

              <ChakraLink
                as={Link}
                to="/password/forgot"
                fontSize="sm"
                textAlign={{
                  base: "center",
                  sm: "right",
                }}
              >
                Forgot password?
              </ChakraLink>

              <Button
                my={2}
                isLoading={isPending || isSubmitting}
                isDisabled={!isValid}
                type="submit"
              >
                Sign in
              </Button>

              <Text align="center" fontSize="sm" color="text.muted">
                Don&apos;t have an account?{" "}
                <ChakraLink as={Link} to="/register">
                  Sign up
                </ChakraLink>
              </Text>
            </Stack>
          </form>
        </Box>
      </Container>
    </Flex>
  );
};

export default Login;
